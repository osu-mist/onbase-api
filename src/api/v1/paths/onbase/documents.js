import { errorBuilder, errorHandler } from 'errors/errors';

import { postDocument } from '../../db/oracledb/onbase-dao';

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
    return errorHandler(res, err);
  }
};

export { post };
