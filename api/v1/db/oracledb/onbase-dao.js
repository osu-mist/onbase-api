const appRoot = require('app-root-path');
const createError = require('http-errors');
const _ = require('lodash');
const { BIND_OUT, NUMBER, STRING } = require('oracledb');

const conn = require('./connection');
const { contrib } = require('./contrib/contrib');
const { serializeOnBase } = require('../../serializers/onbase-serializer');

/**
 * @summary A Helper recursive function to read buffer
 * @function
 * @param {string} osuId OSU ID
 * @param {string[]} osuId OSU ID
 * @returns {Promise<string[]>} Promise object represents a list of records
 */
const getLine = async (connection, lines) => {
  try {
    const { outBinds } = await connection.execute(
      contrib.getLine(),
      {
        line: { dir: BIND_OUT, type: STRING, maxSize: 32767 },
        status: { dir: BIND_OUT, type: NUMBER },
      },
    );
    if (outBinds.line) {
      lines.push(outBinds.line);
    }
    // The status code will be equal to 1 if there is no more output
    if (outBinds.status !== 1) {
      ({ connection, lines } = await getLine(connection, lines));
    }
    return { connection, lines };
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * @summary Return an OnBase record of a person
 * @function
 * @param {string} osuId OSU ID
 * @returns {Promise<Object[]>} Promise object represents an OnBase record
 */
const getOnBase = async (osuId) => {
  let connection = await conn.getConnection();
  try {
    await connection.execute(contrib.getApplications(), { osuId });
    let lines = [];
    ({ connection, lines } = await getLine(connection, lines));

    // The only possible error for this stored procedure is applications for the person not found
    const errorString = lines.length >= 1 ? _.split(lines[0], ';')[14] : undefined;
    if (errorString) {
      throw createError(404, errorString);
    }

    const serializedOnBase = serializeOnBase(lines, osuId);
    return serializedOnBase;
  } finally {
    connection.close();
  }
};

/**
 * @summary Update an OnBase record of a person
 * @function
 * @param {string} osuId OSU ID
 * @param {object} body request body
 * @returns {Promise<Object>} Promise object represents an OnBase record
 */
const patchOnBase = async (osuId, body) => {
  let connection = await conn.getConnection();
  const { attributes } = body.data;
  try {
    await connection.execute(
      contrib.patchApplications(attributes),
      _.assign({ osuId }, attributes),
    );
    let lines = [];
    ({ connection, lines } = await getLine(connection, lines));

    const errorString = lines.length >= 1 ? _.split(lines[0], ';')[14] : undefined;

    // The error reasons are separated by '|'
    const errors = _.split(errorString, '|');

    // Return 404 if one of the error reasons is applications for the person not found
    _.forEach(errors, (error) => {
      if (error.includes('NO APPLICATIONS')) {
        throw createError(404, error);
      }
    });

    // Throw a 400 bad request error with the rest reasons
    if (errorString) {
      throw createError(400, errorString);
    }

    const serializedOnBase = serializeOnBase(lines, osuId);
    return serializedOnBase;
  } finally {
    connection.close();
  }
};

module.exports = { getOnBase, patchOnBase };
