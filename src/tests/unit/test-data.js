import _ from 'lodash';

const fakeId = 'fakeId';
const fakeBaseUrl = '/v1';
// defined as 'last' because a status = 1 will cause getLines() recursion to end
const outBindsLast = {
  rows: [{}],
  outBinds: {
    line: {},
    status: 1,
  },
};
const outBindsRecursive = {
  rows: [{}],
  outBinds: {
    line: {},
    status: 0,
  },
};

/*
 * The 16th element of 'line' returned by execute contains an error
 * length of 17 makes an array 0-16
 * _.range() creates a string '0;1;...15;16'
 */
const errorLineLength = 17;
const outBindsError = {
  outBinds: {
    lines: _.range(errorLineLength).join(';'),
    status: 1,
  },
};

const admissionPatchBody = {
  data: {
    id: fakeId,
    type: 'onBase',
    attributes: {},
  },
};
const invalidAdmissionPatchBody = {};

const rawAdmission = [
  '201901;3;D;20-MAY-2019;AT;20-MAY-2019;02;DSC;T;RA;20-MAY-2019;true;true;SOP8;true',
  '201901;3;D;20-MAY-2019;AT;20-MAY-2019;02;DSC;T;RA;20-MAY-2019;true;true;SOP8;true',
];

export {
  fakeId,
  fakeBaseUrl,
  outBindsLast,
  outBindsRecursive,
  outBindsError,
  errorLineLength,
  admissionPatchBody,
  invalidAdmissionPatchBody,
  rawAdmission,
};
