const appRoot = require('app-root-path');
const _ = require('lodash');

const onBaseDao = require('../../db/oracledb/onbase-dao');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get an OnBase records for a person
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
 * @summary Update an OnBase records for a person
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
      let errorDetails = err;
      if (errorStatusCode === 400) {
        errorDetails = _.split(err.message, '|');
      }
      return errorBuilder(res, errorStatusCode, errorDetails);
    }
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/onbase/{osuId}'].get;
patch.apiDoc = paths['/onbase/{osuId}'].patch;

module.exports = { get, patch };
