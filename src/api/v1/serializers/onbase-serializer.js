import { Serializer as JsonApiSerializer } from 'jsonapi-serializer';
import _ from 'lodash';

import { serializerOptions } from 'utils/jsonapi';
import { openapi } from 'utils/load-openapi';
import { apiBaseUrl, resourcePathLink } from 'utils/uri-builder';

const admissionResourceProp = openapi.definitions.AdmissionResource.properties;
const admissionResourceType = admissionResourceProp.type.enum[0];
const admissionResourceKeys = _.keys(admissionResourceProp.attributes.properties);
const admissionUrl = resourcePathLink(apiBaseUrl, 'onbase/admissions');

/**
 * A function to serialize raw data
 *
 * @param {object[]} rawRows Raw data rows from data source
 * @param {string} osuId OSU ID
 * @returns {object} Serialized resources data
 */
const serializeAdmission = (rawRows, osuId) => {
  const rawAdmission = {
    osuId,
    type: 'admissions',
    applications: [],
  };

  rawAdmission.applications = _.map(rawRows, (rawRow) => {
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
      startSession: array[14],
      aswInd: array[15] === 'Y',
    };
  });

  const serializerArgs = {
    identifierField: 'osuId',
    resourceKeys: admissionResourceKeys,
    resourceUrl: admissionUrl,
    topLevelSelfLink: resourcePathLink(admissionUrl, osuId),
    enableDataLinks: true,
    resourceType: admissionResourceType,
  };

  return new JsonApiSerializer(
    admissionResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawAdmission);
};

export { serializeAdmission };
