const fakeId = 'fakeId';
const fakeBaseUrl = 'https://localhost/v1';
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

const patchBody = {
  data: {
    id: fakeId,
    type: 'onBase',
    attributes: {},
  },
};
const invalidPatchBody = {};

const rawOnBase = [
  '201901;3;D;20-MAY-2019;AT;20-MAY-2019;02;DSC;T;RA;20-MAY-2019;true;true;SOP8;true',
  '201901;3;D;20-MAY-2019;AT;20-MAY-2019;02;DSC;T;RA;20-MAY-2019;true;true;SOP8;true',
];

export {
  fakeId,
  fakeBaseUrl,
  outBindsLast,
  outBindsRecursive,
  patchBody,
  invalidPatchBody,
  rawOnBase,
};
