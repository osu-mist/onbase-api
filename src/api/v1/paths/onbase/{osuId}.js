import _ from 'lodash';

import { errorBuilder, errorHandler } from 'errors/errors';

import * as onBaseDao from '../../db/oracledb/onbase-dao';

/**
 * Get an OnBase records for a person
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const { osuId } = req.params;
    const result = await onBaseDao.getOnBase(osuId);
    return res.send(result);
  } catch (err) {
    if (err.statusCode === 404) {
      const [error] = _.split(err.message, '|');
      return errorBuilder(res, 404, error);
    }
    return errorHandler(res, err);
  }
};

/**
 * Update an OnBase records for a person
 *
 * @type {RequestHandler}
 */
const patch = async (req, res) => {
  try {
    const { osuId } = req.params;
    const { body } = req;
    if (osuId !== body.data.id) {
      return errorBuilder(res, 400, ['OSU ID in path does not match the ID in body.']);
    }
    const result = await onBaseDao.patchOnBase(osuId, body);
    return res.send(result);
  } catch (err) {
    const errorStatusCode = err.statusCode;

    if (errorStatusCode) {
      let errorDetails = _.split(err.message, '|');
      if (errorStatusCode === 404) {
        [errorDetails] = errorDetails;
      }
      return errorBuilder(res, errorStatusCode, errorDetails);
    }
    return errorHandler(res, err);
  }
};

export { get, patch };
