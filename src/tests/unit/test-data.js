/* eslint no-unused-vars: 0 */
const fakeId = 'fakeId';
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

export { outBindsLast, outBindsRecursive };
