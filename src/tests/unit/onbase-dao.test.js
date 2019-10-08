/* eslint no-unused-vars: 0 */
// const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const sinon = require('sinon');

const onbaseDao = require('../../api/v1/db/oracledb/onbase-dao')
const testData = require('./test-data');

chai.should();
chai.use(chaiAsPromised);

describe('Test onbase-dao', () => {
  beforeEach(() => {
    const daoStub = sinon.stub(onbaseDao, 'getOnBase')
    daoStub.returnsArg(0);
  });
  afterEach(() => sinon.restore());

  describe('test', () => {
    it(`dun dun dun`, () => {
      console.log(onbaseDao.getOnBase(0));
      // return onbaseDao.getOnBase(0).should.eventually.be.fulfilled.and.deep.equals(0);
    });
  })
});