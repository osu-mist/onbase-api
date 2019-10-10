const fakeId = 'fakeId';
const fakeBaseUrl = 'https://localhost/v1';
// defined as 'last' because a status = 1 will cause getLines() recursion to end
const outBindsLast = {
  outBinds: {
    line: {},
    status: 1,
  },
};
const outBindsRecursive = {
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

export {
  fakeId,
  fakeBaseUrl,
  outBindsLast,
  outBindsRecursive,
  patchBody,
  invalidPatchBody,
};
