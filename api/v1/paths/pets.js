const appRoot = require('app-root-path');

const { badRequest, errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');
const petsDAO = require('../db/json/pets-dao-example');

/**
 * @summary Get pets
 */
const get = async (req, res) => {
  try {
    const MAX_PAGE_SIZE = 500;
    const { page } = req.query;
    /**
     * Return 400 errors if page[size]/page[number] are not valid
     */
    if (page) {
      const { size, number } = page;
      const isInvalidSize = (size !== '') && (size <= 0 || size > MAX_PAGE_SIZE);
      const isInvalidNumber = (number !== '') && number <= 0;
      const errors = [];

      if (isInvalidSize || isInvalidNumber) {
        if (isInvalidSize) errors.push(`page[size] should be an integer ranging from 1 to ${MAX_PAGE_SIZE}.`);
        if (isInvalidNumber) errors.push('page[number] should be an integer greater than or equal to 1.');
        res.status(400).send(badRequest(errors));
      }
    }

    const result = await petsDAO.getPets(req.query);
    res.send(result);
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/pets'].get;

module.exports = { get };