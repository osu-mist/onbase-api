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

const rawOnBase = {
  termCode: '201901',
  applicationNumber: '3',
  statusCode: 'D',
  statusDate: '20-MAY-2019',
  decisionCode: 'AT',
  decisionDate: '20-MAY-2019',
  levelCode: '02',
  campusCode: 'DSC',
  studentTypeCode: 'T',
  adminCode: 'RA',
  initialCompleteDate: '20-MAY-2019',
  justCompletedInd: true,
  uacPendingInd: true,
  startSession: 'SOP8',
  aswInd: true,
};

export {
  fakeId,
  fakeBaseUrl,
  outBindsLast,
  outBindsRecursive,
  patchBody,
  invalidPatchBody,
  rawOnBase,
};
