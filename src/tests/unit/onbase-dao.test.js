/* eslint no-unused-vars: 0 */
// const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

// const conn = appRoot.require('api/v1/db/oracledb/connection');
const conn = require('../../api/v1/db/oracledb/connection');
const testData = require('./test-data');

const daosSerializer = require('../../api/v1/serializers/onbase-serializer');

chai.should();
chai.use(chaiAsPromised);

let onBaseDao;

describe('Test onbase-dao', () => {
  // the execute function gets called for a variety of reasons in the class being tested
  // each test will need fine tuned control over what is returned from execute
  const connectionStub = (execStub) => {
    sinon.stub(conn, 'getConnection').resolves({
      execute: execStub,
      close: () => null,
    });
  };

  beforeEach(() => {
    const serializeOnBaseStub = sinon.stub(daosSerializer, 'serializeOnBase');
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
      execStub.returns({
        outBinds: {
          line: {},
          status: 1,
        },
      });
      connectionStub(execStub);

      const result = onBaseDao.getOnBase();
      return result.should
        .eventually.be.fulfilled
        .and.deep.equals([{}])
        .and.to.have.length(1);
    });

    it('getOnBase should be fulfilled with multiple results', () => {
      const execStub = sinon.stub();
      // execute first call is ignored for this test case
      execStub.onSecondCall().returns({ outBinds: { line: {}, status: 0 } });
      execStub.returns({
        outBinds: {
          line: {},
          status: 1,
        },
      });
      connectionStub(execStub);

      const result = onBaseDao.getOnBase();
      return result.should
        .eventually.be.fulfilled
        .and.deep.equals([{}, {}])
        .and.to.have.length(2);
    });
  });
});
