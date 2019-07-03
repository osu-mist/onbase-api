const appRoot = require('app-root-path');
const _ = require('lodash');
const { BIND_OUT, NUMBER, STRING } = require('oracledb');

const {
  serializeApplications,
  serializeApplication,
} = require('../../serializers/applications-serializer');

const conn = appRoot.require('api/v1/db/oracledb/connection');
const { contrib } = appRoot.require('api/v1/db/oracledb/contrib/contrib');


/**
 * @summary A Helper recursive function to read buffer
 * @function
 * @returns {Promise<String[]>} Promise object represents a list of records
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
 * @summary Return a list of applications
 * @function
 * @returns {Promise<Object[]>} Promise object represents a list of applications
 */
const getApplications = async (osuId) => {
  let connection = await conn.getConnection();
  try {
    await connection.execute(contrib.getApplications(), { osuId });
    let lines = [];
    ({ connection, lines } = await getLine(connection, lines));

    const rawApplications = [];
    _.forEach(lines, (line) => {
      const array = _.split(line, ',');
      rawApplications.push({
        applicationId: `${array[0]}-${array[1]}-${array[2]}`,
        osuId: array[0],
        termCode: array[1],
        number: array[2],
        decisionCode: array[3],
        levelCode: array[4],
        campusCode: array[5],
        studentTypeCode: array[6],
        admitCode: array[7],
      });
    });

    const serializedPets = serializeApplications(rawApplications, osuId);
    return serializedPets;
  } finally {
    connection.close();
  }
};

/**
 * @summary Update a specific application by unique ID
 * @function
 * @param {string} id Unique application ID
 * @returns {Promise<Object>} Promise object represents a updated application
 */
const patchApplicationById = async (id) => {
  const connection = await conn.getConnection();
  try {
    const { rawApplications } = await connection.execute(contrib.patchApplicationById(id), id);

    if (_.isEmpty(rawApplications)) {
      return undefined;
    }
    if (rawApplications.length > 1) {
      throw new Error('Expect a single object but got multiple results.');
    } else {
      const [rawApplication] = rawApplications;
      const serializedApplication = serializeApplication(rawApplication);
      return serializedApplication;
    }
  } finally {
    connection.close();
  }
};

module.exports = { getApplications, patchApplicationById };
