import { Serializer as JsonApiSerializer } from 'jsonapi-serializer';
import _ from 'lodash';

import { serializerOptions } from 'utils/jsonapi';
import { openapi } from 'utils/load-openapi';
import { apiBaseUrl, resourcePathLink } from 'utils/uri-builder';

const onBaseResourceProp = openapi.definitions.OnBaseResource.properties;
const onBaseResourceType = onBaseResourceProp.type.enum[0];
const onBaseResourceKeys = _.keys(onBaseResourceProp.attributes.properties);
const onBaseUrl = resourcePathLink(apiBaseUrl, 'onbase');

/**
 * A function to serialize raw data
 *
 * @param {object[]} rawRows Raw data rows from data source
 * @param {string} osuId OSU ID
 * @returns {object} Serialized resources data
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

export { serializeOnBase };
