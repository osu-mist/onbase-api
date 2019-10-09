/* eslint no-unused-vars: 0 */
/* eslint no-underscore-dangle: 0 */
// const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const rewire = require('rewire');
const sinon = require('sinon');

// const conn = appRoot.require('api/v1/db/oracledb/connection');
const conn = require('../../api/v1/db/oracledb/connection');
const testData = require('./test-data');

const daosSerializer = require('../../api/v1/serializers/onbase-serializer');

chai.should();
chai.use(chaiAsPromised);

const onBaseDaoRewire = rewire('../../api/v1/db/oracledb/onbase-dao');
let onBaseDao;

describe('Test onbase-dao', () => {
  const connStub = (executeReturn) => sinon.stub(conn, 'getConnection').resolves({
    execute: () => executeReturn,
    close: () => null,
  });
  beforeEach(() => {
    const serializeOnBaseStub = sinon.stub(daosSerializer, 'serializeOnBase');
    serializeOnBaseStub.returnsArg(0);
    const testStub = sinon.stub();
    testStub.returns(0);

    onBaseDaoRewire.__set__('getLine', sinon.stub().returns(0));

    onBaseDao = proxyquire('../../api/v1/db/oracledb/onbase-dao', {
      '../../serializers/onbase-serializer': {
        serializeOnBase: serializeOnBaseStub,
      },
    });
  });
  afterEach(() => sinon.restore());

  describe('Test getOnBase', () => {
    it('dun dun dun', () => {
      // console.log(util.__get__('getLine')());

      connStub({ outBinds: 0 });
      console.log(onBaseDao.getOnBase(0));
    });
  });
});
