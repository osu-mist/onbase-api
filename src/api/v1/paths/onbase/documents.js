import _ from 'lodash';

import { errorBuilder, errorHandler } from 'errors/errors';

import { postDocument } from '../../db/oracledb/onbase-dao';

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
 * Post documents
 *
 * @type {RequestHandler}
 */
const post = async (req, res) => {
  try {
    const { body } = req;
    const result = await postDocument(body);
    return res.send(result, 201);
  } catch (err) {
    if (err.statusCode === 409) {
      return errorBuilder(res, err.statusCode, 'Record with the same document ID and filed name has existed.');
    }
    if (err.statusCode) {
      return buildErrors(res, err);
    }
    return errorHandler(res, err);
  }
};

export { post };
