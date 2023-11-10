import { getDynamoDBClient } from './getDynamoDBClient';

describe('getDynamoDBClient', () => {
  it('returns the mock client', () => {
    getDynamoDBClient();
  });
});
