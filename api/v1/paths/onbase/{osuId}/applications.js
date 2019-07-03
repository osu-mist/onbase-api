const appRoot = require('app-root-path');

const applicationsDao = require('../../../db/oracledb/applications-dao');

const { errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get applications
 */
const get = async (req, res) => {
  try {
    const { osuId } = req.params;
    const result = await applicationsDao.getApplications(osuId);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/onbase/{osuId}/applications'].get;

module.exports = { get };
