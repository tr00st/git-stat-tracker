/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  roots: ["src"],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  }
};