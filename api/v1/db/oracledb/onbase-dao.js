const createError = require('http-errors');
const _ = require('lodash');
const { BIND_OUT, NUMBER, STRING } = require('oracledb');

const conn = require('./connection');
const { contrib } = require('./contrib/contrib');
const { serializeOnBase } = require('../../serializers/onbase-serializer');

/**
 * @summary A Helper function to parse the error string
 * @function
 * @param {string} lines a list of OnBase records
 * @returns {string} A string represent the error reasons
 */
const parseErrorString = (lines) => {
  if (lines.length >= 1) {
    // The 14th item of the splitted array is the error string
    return _.split(lines[0], ';')[14];
  }
  return undefined;
};

/**
 * @summary A Helper recursive function to read buffer
 * @function
 * @param {object} connection Oracle connection object
 * @param {string[]} lines a list of OnBase records
 * @returns {Promise<string[]>} Promise object contains a list of records
 */
const getLine = async (connection, lines) => {
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
    lines = await getLine(connection, lines);
  }
  return lines;
};

/**
 * @summary Return an OnBase record of a person
 * @function
 * @param {string} osuId OSU ID
 * @returns {Promise<Object|HttpError>} Promise object represents a serialized OnBase record or a
 *                                        HTTP error if error string is not null
 */
const getOnBase = async (osuId) => {
  const connection = await conn.getConnection();
  try {
    await connection.execute(contrib.getApplications(), { osuId });
    const lines = await getLine(connection, []);

    // The only possible error for this stored procedure is applications for the person not found
    const errorString = parseErrorString(lines);
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
 * @returns {Promise<Object|HttpError>} Promise object represents a patched serialized OnBase record
 *                                      or HTTP errors if error string is not null
 */
const patchOnBase = async (osuId, body) => {
  const connection = await conn.getConnection();
  const { attributes } = body.data;
  try {
    await connection.execute(
      contrib.patchApplications(attributes),
      _.assign({ osuId }, attributes),
    );
    const lines = await getLine(connection, []);

    const errorString = parseErrorString(lines);

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
