import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import config from 'config';
import createError from 'http-errors';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

import * as testData from './test-data';

chai.should();
chai.use(chaiAsPromised);

let onBaseDao;

describe('Test onbase-dao', () => {
  sinon.replace(config, 'get', () => ({ oracledb: {} }));

  /**
   * ES6 imports now require us to proxyquire the connection class
   * connection needs to be stubbed differently depending on the test
   * therefore proxyquire must be a function called by each test instead of in beforeEach
   *
   * @param {object} execReturn value returned from execute on getConnection
   * @param {object} execStub optional parameter to pass in predefined execute function stub
   */
  const proxyOnBaseDao = (execReturn, execStub) => {
    if (execStub) {
      execStub.returns(execReturn);
    } else {
      execStub = sinon.stub().returns(execReturn);
    }
    const serializeAdmissionStub = sinon.stub().returnsArg(0);
    onBaseDao = proxyquire('api/v1/db/oracledb/onbase-dao', {
      './connection': {
        getConnection: sinon.stub().resolves({
          execute: execStub,
          close: () => null,
        }),
      },
      '../../serializers/onbase-serializer': {
        serializeAdmission: serializeAdmissionStub,
      },
    });
  };

  const testSingleResult = (testFunction) => {
    proxyOnBaseDao(testData.outBindsLast);

    const result = testFunction();
    return result.should
      .eventually.be.fulfilled
      .and.deep.equals([{}])
      .and.to.have.length(1);
  };

  const testMultipleResults = (testFunction) => {
    const execStub = sinon.stub();
    // third call is a special case that we want to cause getLine to recurse
    execStub.onThirdCall().returns(testData.outBindsRecursive);
    proxyOnBaseDao(testData.outBindsLast, execStub);

    const result = testFunction();
    return result.should
      .eventually.be.fulfilled
      .and.deep.equals([{}, {}])
      .and.to.have.length(2);
  };

  /*
   * error message will be the same as the line length
   * because we are generating an array of numbers
   */
  const testLineErrorResult = (testFunction) => {
    proxyOnBaseDao(testData.outBindsError);

    const result = testFunction();
    return result.should
      .eventually.be.rejectedWith(testData.errorLineLength)
      .and.be.an.instanceOf(createError.NotFound);
  };

  afterEach(() => sinon.restore());

  describe('Test getAdmission', () => {
    const getFunction = () => onBaseDao.getAdmission();
    it('getAdmission should be fulfilled with a single result', () => testSingleResult(getFunction));

    it('getAdmission should be fulfilled with multiple results', () => testMultipleResults(getFunction));

    it(`getAdmission should throw error when line length is >= ${testData.errorLineLength - 1}`, () => testLineErrorResult(getFunction));
  });

  describe('Test patchAdmission', () => {
    const patchFunction = () => onBaseDao.patchAdmission(
      testData.fakeId,
      testData.admissionPatchBody,
    );
    it('patchAdmission should be fulfilled with a single result', () => testSingleResult(patchFunction));

    it('patchAdmission should be fulfilled with multiple results', () => testMultipleResults(patchFunction));

    it(`patchAdmission should throw error when line length is >= ${testData.errorLineLength - 1}`, () => testLineErrorResult(patchFunction));

    it('patchAdmission should throw error with improper body', () => {
      const result = onBaseDao.patchAdmission(testData.fakeId, testData.invalidPatchBody);
      return result.should
        .eventually.be.rejected
        .and.be.an.instanceOf(Error);
    });
  });
});
