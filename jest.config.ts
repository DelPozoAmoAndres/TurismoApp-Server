import type { Config } from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ["<rootDir>/__test__/**/*.ts?(x)"],
  moduleNameMapper: {
    "@controllers/(.*)": "<rootDir>/src/controllers/$1",
    "@services/(.*)": "<rootDir>/src/services/$1",
    "@customTypes/(.*)": "<rootDir>/src/customTypes/$1",
    "@models/(.*)": "<rootDir>/src/models/$1",
    "@routes/(.*)": "<rootDir>/src/routes/$1",
    "@utils/(.*)": "<rootDir>/src/utils/$1",
    "@app": "<rootDir>/app.ts",
    "@middlewares/(.*)": "<rootDir>/src/middlewares/$1",
  }
};
export default config;