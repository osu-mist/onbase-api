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
});
