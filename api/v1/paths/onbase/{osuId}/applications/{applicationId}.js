const appRoot = require('app-root-path');

const applicationsDao = require('../../../../db/oracledb/applications-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Patch pet by unique ID
 */
const patch = async (req, res) => {
  try {
    const { osuId } = req.params;
    const result = await applicationsDao.patchApplicationById(osuId);
    if (!result) {
      errorBuilder(res, 404, 'A application with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

patch.apiDoc = paths['/onbase/{osuId}/applications/{applicationId}'].patch;

module.exports = { patch };
