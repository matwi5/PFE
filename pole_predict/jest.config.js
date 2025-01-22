const dotenv = require('dotenv');

// Charger les variables d'environnement à partir de `.env.local`
dotenv.config({ path: '.env.local' });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};