import { errorHandler } from 'errors/errors';

import { getHolds } from '../../../db/oracledb/onbase-dao';

/**
 * Get holds
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const { params: { osuId }, query: { codes } } = req;
    const result = await getHolds(osuId, codes);
    res.send(result);
  } catch (err) {
    errorHandler(res, err);
  }
};

export { get };
