const appRoot = require('app-root-path');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink } = appRoot.require('utils/uri-builder');

const applicationResourceProp = openapi.definitions.ApplicationResource.properties;
const applicationResourceType = applicationResourceProp.type.enum[0];
const applicationResourceKeys = _.keys(applicationResourceProp.attributes.properties);
const applicationResourcePath = 'applications';
const applicationResourceUrl = resourcePathLink(apiBaseUrl, applicationResourcePath);

/**
 * @summary A function to serialize raw applications data
 * @function
 * @param {Object[]} rawApplications Raw applications data rows from data source
 * @returns {Object} Serialized application resources data
 */
const serializeApplications = (rawApplications) => {
  const topLevelSelfLink = applicationResourceUrl;

  const serializerArgs = {
    identifierField: 'applicationId',
    resourceKeys: applicationResourceKeys,
    resourcePath: applicationResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
    resourceType: applicationResourceType,
  };

  return new JsonApiSerializer(
    applicationResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawApplications);
};

/**
 * @summary A function to serialize raw application data
 * @function
 * @param {Object} rawApplication Raw application data rows from data source
 * @returns {Object} Serialized application resource data
 */
const serializeApplication = (rawApplication) => {
  const topLevelSelfLink = resourcePathLink(applicationResourceUrl, 'applicationId');
  const serializerArgs = {
    identifierField: 'applicationId',
    resourceKeys: applicationResourceKeys,
    resourcePath: applicationResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    applicationResourceType,
    serializerOptions(serializerArgs, applicationResourcePath, topLevelSelfLink),
  ).serialize(rawApplication);
};

module.exports = {
  serializeApplication,
  serializeApplications,
};
