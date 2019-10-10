const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
const _ = require('lodash');

const { openapi } = require('utils/load-openapi');
const onBaseSerializer = require('api/v1/serializers/onbase-serializer');
const testData = require('./test-data');


chai.should();
chai.use(chaiAsPromised);
chai.use(chaiSubset);
const { expect } = chai;

describe('Test onbase-serializer', () => {
  const { fakeId, fakeBaseUrl } = testData;

  const resourceSubsetSchema = (resourceType, resourceAttributes) => {
    const selfLink = `${fakeBaseUrl}/${resourceType.toLowerCase()}/${fakeId}`;
    const schema = {
      links: {
        self: selfLink,
      },
      data: {
        id: fakeId,
        type: 'onBase',
        links: { self: selfLink },
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
    const { rawOnBase } = testData;
    const resourceType = 'onBase';

    const serializedOnBase = serializeOnBase(rawOnBase, fakeId);
    testSingleResource(serializedOnBase, resourceType, null);

    const { applications } = serializedOnBase.data.attributes;
    _.each(applications, (app) => {
      expect(app).to.have.all.keys(_.keys(getDefinitionProps('Application')));
    });
  });
});
