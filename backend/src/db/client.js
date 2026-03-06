/**
 * DB client selector.
 * Uses mock in development (no DYNAMODB_ENDPOINT set),
 * and DynamoDB in production.
 */

const useMock =
  process.env.NODE_ENV !== 'production' &&
  !process.env.DYNAMODB_ENDPOINT &&
  process.env.USE_MOCK_DB === 'true';

const db = useMock ? require('./mock') : require('./dynamo');

if (useMock) {
  console.log('[db] Using in-memory mock database');
} else {
  console.log('[db] Using DynamoDB at', process.env.DYNAMODB_ENDPOINT || 'AWS');
}

module.exports = db;
