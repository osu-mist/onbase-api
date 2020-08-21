import createError from 'http-errors';
import _ from 'lodash';
import { BIND_OUT, NUMBER, STRING } from 'oracledb';

import { getConnection } from './connection';
import { contrib } from './contrib/contrib';
import {
  serializeAdmission,
  serializeFinancialAid,
  serializeHolds,
} from '../../serializers/onbase-serializer';

/**
 * A Helper function to parse the error string
 *
 * @param {string} lines a list of OnBase records
 * @param {number} errorPosition error position
 * @returns {string} A string represent the error reasons
 */
const parseErrorString = (lines, errorPosition) => {
  if (lines.length >= 1) {
    return _.split(lines[0], ';')[errorPosition];
  }
  return undefined;
};

/**
 * A Helper recursive function to read buffer
 *
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
 * A Helper function to check if person not exist
 *
 * @param {object} connection Oracle connection object
 * @param {string} osuId OSU ID
 * @returns {Promise<string>} Promise object with error message if person not exist
 */
const personNotExist = async (connection, osuId) => {
  const { rows } = await connection.execute(contrib.personExist(), { osuId });
  if (_.isEmpty(rows)) {
    return `${osuId} - No person exists`;
  }
  return null;
};

/**
 * Return admission record of a person
 *
 * @param {string} osuId OSU ID
 * @param {number} applicationNumber application number
 * @returns {Promise<object|HttpError>} Promise object represents a serialized admission record or a
 *                                      HTTP error if error string is not null
 */
const getAdmission = async (osuId, applicationNumber) => {
  const connection = await getConnection();
  try {
    const errorMessage = await personNotExist(connection, osuId);
    if (errorMessage) {
      throw createError(404, errorMessage);
    }

    await connection.execute(contrib.getApplications(), { osuId });
    const lines = await getLine(connection, []);

    // The 22th item of the splitted array is the error string
    const errorString = parseErrorString(lines, 21);
    if (errorString) {
      throw createError(400, errorString);
    }

    const serializedAdmission = serializeAdmission(lines, osuId, applicationNumber);

    return serializedAdmission;
  } finally {
    connection.close();
  }
};

/**
 * Update admission record of a person
 *
 * @param {string} osuId OSU ID
 * @param {object} body request body
 * @returns {Promise<object|HttpError>} Promise object represents a patched serialized admission
 *                                      record or HTTP errors if error string is not null
 */
const patchAdmission = async (osuId, body) => {
  const connection = await getConnection();
  const { attributes } = body.data;
  try {
    const errorMessage = await personNotExist(connection, osuId);
    if (errorMessage) {
      throw createError(404, errorMessage);
    }

    await connection.execute(
      contrib.patchApplications(attributes),
      { ...{ osuId }, ...attributes },
    );
    const lines = await getLine(connection, []);

    // The 22th item of the splitted array is the error string
    const errorString = parseErrorString(lines, 21);
    if (errorString) {
      throw createError(400, errorString);
    }

    const serializedAdmission = serializeAdmission(lines, osuId);
    return serializedAdmission;
  } finally {
    connection.close();
  }
};

/**
 * Return financial aid record of a person
 *
 * @param {string} osuId OSU ID
 * @param {string} financialAidYear financial aid year
 * @returns {Promise<object|HttpError>} Promise object represents a serialized financial aid record
 *                                      or a HTTP error if error string is not null
 */
const getFinancialAid = async (osuId, financialAidYear) => {
  const connection = await getConnection();
  try {
    const errorMessage = await personNotExist(connection, osuId);
    if (errorMessage) {
      throw createError(404, errorMessage);
    }

    await connection.execute(contrib.getTrackingRequirements(), { osuId, financialAidYear });
    const lines = await getLine(connection, []);

    // The 6th item of the splitted array is the error string
    const errorString = parseErrorString(lines, 5);
    if (errorString) {
      throw createError(400, errorString);
    }

    return serializeFinancialAid(lines, osuId);
  } finally {
    connection.close();
  }
};

/**
 * Update financial aid record of a person
 *
 * @param {string} osuId OSU ID
 * @param {object} body request body
 * @returns {Promise<object|HttpError>} Promise object represents a patched serialized financial aid
 *                                      record or HTTP errors if error string is not null
 */
const patchFinancialAid = async (osuId, body) => {
  const connection = await getConnection();
  const { attributes } = body.data;
  try {
    const errorMessage = await personNotExist(connection, osuId);
    if (errorMessage) {
      throw createError(404, errorMessage);
    }

    await connection.execute(
      contrib.patchTrackingRequirements(attributes),
      { ...{ osuId }, ...attributes },
    );
    const lines = await getLine(connection, []);

    // The 6th item of the splitted array is the error string
    const errorString = parseErrorString(lines, 5);
    if (errorString) {
      throw createError(400, errorString);
    }

    return serializeFinancialAid(lines, osuId);
  } finally {
    connection.close();
  }
};

/**
 * Return holds record of a person
 *
 * @param {string} osuId OSU ID
 * @param {string} codes hold codes
 * @returns {Promise<object|HttpError>} Promise object represents a serialized holds record
 *                                      or a HTTP error if error string is not null
 */
const getHolds = async (osuId, codes) => {
  const connection = await getConnection();
  try {
    const errorMessage = await personNotExist(connection, osuId);
    if (errorMessage) {
      throw createError(404, errorMessage);
    }

    await connection.execute(contrib.getHolds(), { osuId });
    const lines = await getLine(connection, []);

    // The 18th item of the splitted array is the error string
    const errorString = parseErrorString(lines, 17);
    if (errorString) {
      throw createError(400, errorString);
    }

    return serializeHolds(lines, osuId, codes);
  } finally {
    connection.close();
  }
};

export {
  getAdmission,
  patchAdmission,
  getFinancialAid,
  patchFinancialAid,
  getHolds,
};
