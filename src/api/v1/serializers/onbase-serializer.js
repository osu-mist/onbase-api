import { Serializer as JsonApiSerializer } from 'jsonapi-serializer';
import _ from 'lodash';

import { serializerOptions } from 'utils/jsonapi';
import { openapi } from 'utils/load-openapi';
import { apiBaseUrl, resourcePathLink } from 'utils/uri-builder';

const admissionResourceProp = openapi.definitions.AdmissionResource.properties;
const admissionResourceType = admissionResourceProp.type.enum[0];
const admissionResourceKeys = _.keys(admissionResourceProp.attributes.properties);
const admissionUrl = resourcePathLink(apiBaseUrl, 'onbase/admissions');

const financialAidResourceProp = openapi.definitions.FinancialAidResource.properties;
const financialAidResourceType = financialAidResourceProp.type.enum[0];
const financialAidResourceKeys = _.keys(financialAidResourceProp.attributes.properties);
const financialAidUrl = resourcePathLink(apiBaseUrl, 'onbase/financial-aid');

const holdsResourceProp = openapi.definitions.HoldsResource.properties;
const holdsResourceType = holdsResourceProp.type.enum[0];
const holdsResourceKeys = _.keys(holdsResourceProp.attributes.properties);
const holdsUrl = resourcePathLink(apiBaseUrl, 'onbase/holds');

/**
 * A function to serialize raw admission data
 *
 * @param {object[]} rawRows Raw data rows from data source
 * @param {string} osuId OSU ID
 * @param {number} applicationNumberParam application number parameter
 * @returns {object} Serialized resources data
 */
const serializeAdmission = (rawRows, osuId, applicationNumberParam) => {
  const rawAdmission = {
    osuId,
    type: admissionResourceType,
    applications: [],
  };

  let applications = {};
  _.forEach(rawRows, (rawRow) => {
    const array = _.split(rawRow, ';');
    const termCode = array[1];
    const applicationNumber = _.toInteger(array[2]);
    const applicationId = `${termCode}-${applicationNumber}`;

    const checklistItem = {
      admrCode: array[17],
      mandInd: array[18] === 'Y',
      receiveDate: array[19],
      comment: array[20],
    };

    if (!(applicationId in applications)) {
      applications[applicationId] = {
        termCode,
        applicationNumber,
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
        currentDocMandInd: array[16] === 'Y',
        checklist: [checklistItem],
      };
    } else {
      applications[applicationId].checklist.push(checklistItem);
    }
  });

  // filter the applications by applicationNumber if parameter is provided
  if (!_.isUndefined(applicationNumberParam)) {
    applications = _.filter(applications, { applicationNumber: applicationNumberParam });
  }

  rawAdmission.applications = _.values(applications);

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

/**
 * A function to serialize raw financial aid data
 *
 * @param {object[]} rawRows Raw data rows from data source
 * @param {string} osuId OSU ID
 * @returns {object} Serialized resources data
 */
const serializeFinancialAid = (rawRows, osuId) => {
  const rawFinancialAid = {
    osuId,
    type: financialAidResourceType,
    trackingRequirements: [],
  };

  rawFinancialAid.trackingRequirements = _.map(rawRows, (rawRow) => {
    const array = _.split(rawRow, ';');
    return {
      financialAidYear: array[1],
      trackingRequirement: array[2],
      trackingStatusCode: array[3],
      statusDate: array[4],
    };
  });

  const serializerArgs = {
    identifierField: 'osuId',
    resourceKeys: financialAidResourceKeys,
    resourceUrl: financialAidUrl,
    topLevelSelfLink: resourcePathLink(financialAidUrl, osuId),
    enableDataLinks: true,
    resourceType: financialAidResourceType,
  };

  return new JsonApiSerializer(
    financialAidResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawFinancialAid);
};

/**
 * A function to serialize raw holds data
 *
 * @param {object[]} rawRows Raw data rows from data source
 * @param {string} osuId OSU ID
 * @param {string} codes Hold codes
 * @returns {object} Serialized resources data
 */
const serializeHolds = (rawRows, osuId, codes) => {
  const rawHolds = {
    osuId,
    type: holdsResourceType,
    holds: [],
  };

  const holds = _.map(rawRows, (rawRow) => {
    const array = _.split(rawRow, ';');
    return {
      code: array[1],
      description: array[2],
      fromDate: array[3],
      toDate: array[4],
      reason: array[5],
      organizationCode: array[6] || null,
      organizationDescription: array[7] || null,
      processesAffected: _.compact([
        array[8],
        array[9],
        array[10],
        array[11],
        array[12],
        array[13],
        array[14],
        array[15],
      ]),
      releasedInd: array[16] === 'Y',
    };
  });

  if (codes) {
    _.each(holds, (hold) => {
      if (_.includes(codes, hold.code)) {
        rawHolds.holds.push(hold);
      }
    });
  } else {
    rawHolds.holds = holds;
  }

  const serializerArgs = {
    identifierField: 'osuId',
    resourceKeys: holdsResourceKeys,
    resourceUrl: holdsUrl,
    topLevelSelfLink: resourcePathLink(holdsUrl, osuId),
    enableDataLinks: true,
    resourceType: holdsResourceType,
  };

  return new JsonApiSerializer(
    holdsResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawHolds);
};

export {
  serializeAdmission,
  serializeFinancialAid,
  serializeHolds,
};
