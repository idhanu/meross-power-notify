import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  CONFIG_AWS_REGION,
  CONFIG_ENVIRONMENT,
  CONFIG_LOCAL_DYNAMO_DB_PORT,
  CONFIG_TEST_DYNAMO_DB_PORT,
} from './config';

// Create a DynamoDB client for local instance
let dynamodbClient: DynamoDBClient | null = null;

export const getDynamoDBClient = () => {
  if (dynamodbClient) {
    return dynamodbClient;
  }

  if (CONFIG_ENVIRONMENT === 'local' || CONFIG_ENVIRONMENT === 'test') {
    const port = CONFIG_ENVIRONMENT === 'test' ? CONFIG_TEST_DYNAMO_DB_PORT : CONFIG_LOCAL_DYNAMO_DB_PORT;

    dynamodbClient = new DynamoDBClient({
      credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
      region: 'us-east-1',
      endpoint: `http://localhost:${port}`,
    });
  } else {
    dynamodbClient = new DynamoDBClient({ region: CONFIG_AWS_REGION });
  }

  return dynamodbClient;
};
