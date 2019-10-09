/* eslint no-unused-vars: 0 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const testData = require('./test-data');

const onbaseSerializer = require('../../api/v1/serializers/onbase-serializer');

chai.should();
chai.use(chaiAsPromised);
const { expect } = chai;
