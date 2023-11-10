import request from 'supertest';
import { PostTransactionsBody, app } from '..';
import { OrganisationService } from '../services/organisationBalance';
import { LimitReachedError, TooManyTransactionsError, BalanceDiscrepancyError } from '../utils/errors';
import logger from '../pino';

jest.mock('../services/organisationBalance');
jest.mock('../pino');

const mockAddTransactionWithRetries = jest.fn();

const MockLedgerClass = OrganisationService as jest.MockedClass<typeof OrganisationService>;

MockLedgerClass.mockImplementation(() => {
  return {
    addTransactionWithRetries: mockAddTransactionWithRetries,
  } as unknown as OrganisationService;
});

const transactionInput: PostTransactionsBody = {
  organisationId: 'test',
  accountType: 'prepaid',
  amount: -75,
  description: 'transaction description 3',
  reference: 'ref3',
  limit: 0,
};

describe('/transaction endpoint', () => {
  beforeAll(() => {
    logger.level = 'info';
  });
  afterAll(() => {
    logger.level = 'silent';
  });
  beforeEach(() => {
    mockAddTransactionWithRetries.mockClear();
    (logger.info as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
  });

  it('handles ErrorLimitReached error', async () => {
    mockAddTransactionWithRetries.mockImplementation(() => {
      throw new LimitReachedError(10);
    });

    const response = await request(app).post('/transactions').send(transactionInput);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errorCode: 3005,
      message: 'Cannot create transaction because the limit (10) was reached',
    });

    expect(logger.info).toHaveBeenCalledWith(
      { errorMessage: 'Cannot create transaction because the limit (10) was reached' },
      'Error handled',
    );
  });

  it('handles CannotAcquireNextTransactions error', async () => {
    const errorMessage = 'Details about the error';
    mockAddTransactionWithRetries.mockImplementation(() => {
      throw new TooManyTransactionsError(errorMessage);
    });

    const response = await request(app).post('/transactions').send(transactionInput);

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      errorCode: 3006,
      message: 'Next transaction cannot be acquired because of too many other requests: ' + errorMessage,
    });

    expect(logger.info).toHaveBeenCalledWith(
      { errorMessage: 'Next transaction cannot be acquired because of too many other requests: ' + errorMessage },
      'Error handled',
    );
  });

  it('handles BalanceDiscrepancyOccurred error', async () => {
    mockAddTransactionWithRetries.mockImplementation(() => {
      throw new BalanceDiscrepancyError(20, 30);
    });

    const response = await request(app).post('/transactions').send(transactionInput);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errorCode: 3007,
      message:
        'Cannot create a transaction because balance is different to the expected balance (30) compared to the current balance (20)',
    });

    expect(logger.info).toHaveBeenCalledWith(
      {
        errorMessage:
          'Cannot create a transaction because balance is different to the expected balance (30) compared to the current balance (20)',
      },
      'Error handled',
    );
  });

  it('handles generic error', async () => {
    mockAddTransactionWithRetries.mockImplementation(() => {
      throw Error('Unknown error');
    });

    const response = await request(app).post('/transactions').send(transactionInput);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      errorCode: 3000,
      message: 'Unexpected error occurred: Unknown error',
    });

    expect(logger.error).toHaveBeenCalledWith(
      {
        errorMessage: 'Unknown error',
        stack: expect.anything(),
      },
      'Unexpected error occurred',
    );
  });
});
