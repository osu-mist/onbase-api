/* eslint no-unused-vars: 0 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const testData = require('./test-data');
const { openapi } = require('../../utils/load-openapi');

const onBaseSerializer = require('../../api/v1/serializers/onbase-serializer');

chai.should();
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Test onbase-serializer', () => {
  const { fakeId, fakeBaseUrl } = testData;

  const resourceSubsetSchema = (resourceType, resourceAttributes) => {
    const schema = {
      links: {
        self: `${fakeBaseUrl}/${resourceType}`,
      },
      data: {
        id: fakeId,
        type: resourceType,
        links: { self: null },
      },
    };
    if (resourceAttributes) {
      schema.data.attributes = resourceAttributes;
    }
    return schema;
  };

  /**
   * Helper function for lite-testing single resource
   *
   * @param {object} serializedResource serialized resource
   * @param {string} resourceType resource type
   * @param {string} nestedProps field name of the nested properties
   */
  const testSingleResource = (serializedResource, resourceType, nestedProps) => {
    expect(serializedResource).to.containSubset(resourceSubsetSchema(resourceType));

    if (nestedProps) {
      expect(serializedResource).to.have.nested.property(`data.attributes.${nestedProps}`);
    }
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

  it('Test serializeOnBase', () => {
    const { serializeOnBase } = onBaseSerializer;
  });
});
