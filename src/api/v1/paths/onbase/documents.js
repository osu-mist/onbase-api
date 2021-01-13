import { errorHandler } from 'errors/errors';

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
    res.send(result);
  } catch (err) {
    errorHandler(res, err);
  }
};

export { post };
