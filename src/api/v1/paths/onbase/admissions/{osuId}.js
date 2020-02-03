import _ from 'lodash';

import { errorBuilder, errorHandler } from 'errors/errors';

import * as onBaseDao from '../../../db/oracledb/onbase-dao';

/**
 * Helper function to build error
 *
 * @type {RequestHandler}
 */
const buildErrors = (res, err) => {
  const { statusCode, message } = err;

  // The error reasons are separated by '|'
  let errorDetails = _.split(message, '|');
  if (statusCode === 404) {
    [errorDetails] = errorDetails;
  }
  return errorBuilder(res, statusCode, errorDetails);
};

/**
 * Get an admission record for a person
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const { osuId } = req.params;
    const { applicationNumber } = req.query;
    const result = await onBaseDao.getAdmission(osuId, applicationNumber);
    return res.send(result);
  } catch (err) {
    if (err.statusCode) {
      return buildErrors(res, err);
    }
    return errorHandler(res, err);
  }
};

/**
 * Update an admission record for a person
 *
 * @type {RequestHandler}
 */
const patch = async (req, res) => {
  try {
    const { osuId } = req.params;
    const { body } = req;
    if (osuId !== body.data.id) {
      return errorBuilder(res, 409, 'OSU ID in path does not match the ID in body.');
    }
    const result = await onBaseDao.patchAdmission(osuId, body);
    return res.send(result);
  } catch (err) {
    if (err.statusCode) {
      return buildErrors(res, err);
    }
    return errorHandler(res, err);
  }
};

export { get, patch };
