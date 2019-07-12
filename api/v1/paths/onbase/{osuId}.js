const appRoot = require('app-root-path');

const onBaseDao = require('../../db/oracledb/onbase-dao');

const { errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get applications
 */
const get = async (req, res) => {
  try {
    const { osuId } = req.params;
    const result = await onBaseDao.getOnBase(osuId);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/onbase/{osuId}'].get;

module.exports = { get };
