const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const conn = require('../../api/v1/db/oracledb/connection');
const testData = require('./test-data');
const onBaseSerializer = require('../../api/v1/serializers/onbase-serializer');

chai.should();
chai.use(chaiAsPromised);

let onBaseDao;

describe('Test onbase-dao', () => {
  /*
  * The execute function gets called for a variety of reasons in the class being tested
  * Each test will need fine tuned control over what is returned from execute
  */
  const connectionStub = (execStub) => {
    sinon.stub(conn, 'getConnection').resolves({
      execute: execStub,
      close: () => null,
    });
  };

  beforeEach(() => {
    const serializeOnBaseStub = sinon.stub(onBaseSerializer, 'serializeOnBase');
    serializeOnBaseStub.returnsArg(0);

    onBaseDao = proxyquire('../../api/v1/db/oracledb/onbase-dao', {
      '../../serializers/onbase-serializer': {
        serializeOnBase: serializeOnBaseStub,
      },
    });
  });
  afterEach(() => sinon.restore());

  describe('Test getOnBase', () => {
    it('getOnBase should be fulfilled with a single result', () => {
      const execStub = sinon.stub();
      execStub.returns(testData.outBindsLast);
      connectionStub(execStub);

      const result = onBaseDao.getOnBase();
      return result.should
        .eventually.be.fulfilled
        .and.deep.equals([{}])
        .and.to.have.length(1);
    });

    it('getOnBase should be fulfilled with multiple results', () => {
      const execStub = sinon.stub();
      // third call is a special case that we want to cause getLine to recurse
      execStub.onThirdCall().returns(testData.outBindsRecursive);
      execStub.returns(testData.outBindsLast);
      connectionStub(execStub);

      const result = onBaseDao.getOnBase();
      return result.should
        .eventually.be.fulfilled
        .and.deep.equals([{}, {}])
        .and.to.have.length(2);
    });

    it('getOnBase should throw error when line length is >= 16', () => {
      /*
       * The 16th element of 'line' returned by execute contains an error
       * length of 17 makes an array 0-16
       */
      const lineLength = 17;
      // creates a string '0;1;...15;16'
      const line = _.range(lineLength).join(';');
      const execStub = sinon.stub();
      execStub.returns({ outBinds: { line, status: 1 } });
      connectionStub(execStub);

      const result = onBaseDao.getOnBase();
      return result.should
        .eventually.be.rejectedWith(lineLength) // error message will be whatever is 16th element
        .and.be.an.instanceOf(Error);
    });
  });

  describe('Test patchOnBase', () => {
    it('patchOnBase should be fulfilled with a single result', () => {
      const execStub = sinon.stub();
      execStub.returns(testData.outBindsLast);
      connectionStub(execStub);

      const result = onBaseDao.patchOnBase(testData.fakeId, testData.patchBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equals([{}])
        .and.to.have.length(1);
    });

    it('patchOnBase should be fulfilled with multiple results', () => {
      const execStub = sinon.stub();
      // third call is a special case that we want to cause getLine to recurse
      execStub.onThirdCall().returns(testData.outBindsRecursive);
      execStub.returns(testData.outBindsLast);
      connectionStub(execStub);

      const result = onBaseDao.patchOnBase(testData.fakeId, testData.patchBody);
      return result.should
        .eventually.be.fulfilled
        .and.deep.equals([{}, {}])
        .and.to.have.length(2);
    });

    it('patchOnBase should throw error when line length is >= 16', () => {
      // The 16th element of 'line' returned by execute contains an error
      const lineLength = 17; // length of 17 makes an array 0-16
      const line = [...Array(lineLength).keys()].join(';'); // creates a string '0;1;...15;16'
      const execStub = sinon.stub();
      execStub.returns({ outBinds: { line, status: 1 } });
      connectionStub(execStub);

      const result = onBaseDao.patchOnBase(testData.fakeId, testData.patchBody);
      return result.should
        .eventually.be.rejectedWith(lineLength) // error message will be whatever is 16th element
        .and.be.an.instanceOf(Error);
    });

    it('patchOnBase should throw error with improper body', () => {
      const result = onBaseDao.patchOnBase(testData.fakeId, testData.invalidPatchBody);
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });
  });
});
