const appRoot = require('app-root-path');
const JsonApiSerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { apiBaseUrl, resourcePathLink } = appRoot.require('utils/uri-builder');

const onBaseResourceProp = openapi.definitions.OnBaseResource.properties;
const onBaseResourceType = onBaseResourceProp.type.enum[0];
const onBaseResourceKeys = _.keys(onBaseResourceProp.attributes.properties);
const onBaseUrl = resourcePathLink(apiBaseUrl, 'onbase');

/**
 * @summary A function to serialize raw data
 * @function
 * @param {Object[]} rawRows Raw data rows from data source
 * @param {String} osuId OSU ID
 * @returns {Object} Serialized resources data
 */
const serializeOnBase = (rawRows, osuId) => {
  const rawOnBase = {
    osuId,
    type: 'onBase',
    applications: [],
  };

  rawOnBase.applications = _.map(rawRows, (rawRow) => {
    const array = _.split(rawRow, ';');
    return {
      termCode: array[1],
      applicationNumber: array[2],
      decisionCode: array[3],
      decisionDate: array[4],
      levelCode: array[5],
      campusCode: array[6],
      studentTypeCode: array[7],
      admitCode: array[8],
      statusCode: array[9],
      statusDate: array[10],
      initialCompleteDate: array[11],
      justCompletedInd: array[12] === 'Y',
      uacPendingInd: array[13] === 'Y',
    };
  });

  const serializerArgs = {
    identifierField: 'osuId',
    resourceKeys: onBaseResourceKeys,
    resourceUrl: onBaseUrl,
    topLevelSelfLink: resourcePathLink(onBaseUrl, osuId),
    enableDataLinks: true,
    resourceType: onBaseResourceType,
  };

  return new JsonApiSerializer(
    onBaseResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawOnBase);
};

module.exports = {
  serializeOnBase,
};
