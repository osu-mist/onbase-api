import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSubset from 'chai-subset';
import _ from 'lodash';

import * as onBaseSerializer from 'api/v1/serializers/onbase-serializer';
import { openapi } from 'utils/load-openapi';
import * as testData from './test-data';

chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test onbase-serializer', () => {
  const { fakeId, fakeBaseUrl } = testData;

  const resourceSubsetSchema = (resourceType, resourceAttributes) => {
    const selfLink = `${fakeBaseUrl}/onbase/${resourceType.toLowerCase()}/${fakeId}`;
    const schema = {
      links: {
        self: selfLink,
      },
      data: {
        id: fakeId,
        type: 'admissions',
        links: { self: selfLink },
      },
    };
    if (resourceAttributes) {
      schema.data.attributes = resourceAttributes;
    }
    return schema;
  };

  /**
   * Helper function to get definition from openapi specification
   *
   * @param {string} definition the name of definition
   * @param {object} nestedOption nested option
   * @param {boolean} nestedOption.dataItem a boolean which represents whether it's a data item
   * @param {string} nestedOption.dataField data field name
   * @returns {object} definition from openapi specification
   */
  const getDefinitionProps = (definition, nestedOption) => {
    let result = openapi.definitions[definition].properties;
    if (nestedOption) {
      const { dataItem, dataField } = nestedOption;
      if (dataItem) {
        result = result.data.items.properties.attributes.properties;
      } else if (dataField) {
        result = result.data.properties.attributes.properties[dataField].items.properties;
      }
    }
    return result;
  };

  it('Test serializeAdmission', () => {
    const { serializeAdmission } = onBaseSerializer;
    const { rawAdmission } = testData;
    const resourceType = 'admissions';

    const serializedAdmission = serializeAdmission(rawAdmission, fakeId);
    expect(serializedAdmission).to.containSubset(resourceSubsetSchema(resourceType));

    const { applications } = serializedAdmission.data.attributes;
    _.each(applications, (app) => {
      expect(app).to.have.all.keys(_.keys(getDefinitionProps('Application')));
    });
  });
});
