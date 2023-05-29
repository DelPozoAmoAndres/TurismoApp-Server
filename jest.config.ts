import type { Config } from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  preset: '@shelf/jest-mongodb',
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
export default config;