import { AccountParams } from '../entities/account';

export abstract class CustomError extends Error {
  public abstract errorCode: number;
  public abstract status: number;
}

export class LimitReachedError extends CustomError {
  public errorCode = 3005;
  public status = 400;
  constructor(limit: number) {
    super();
    this.message = `Cannot create transaction because the limit (${limit}) was reached`;
    this.name = 'LimitReachedError';
  }
}

export class TooManyTransactionsError extends CustomError {
  public errorCode = 3006;
  public status = 429;
  constructor(details: string) {
    super();
    this.message = 'Next transaction cannot be acquired because of too many other requests: ' + details;
    this.name = 'TooManyTransactionsError';
  }
}

export class BalanceDiscrepancyError extends CustomError {
  public errorCode = 3007;
  public status = 400;
  constructor(currentBalance: number, expectedBalance: number) {
    super();
    this.message = `Cannot create a transaction because balance is different to the expected balance (${expectedBalance}) compared to the current balance (${currentBalance})`;
    this.name = 'BalanceDiscrepancyError';
  }
}

export class ValidationError extends CustomError {
  public errorCode = 3008;
  public status = 400;
  public errors: string[] = [];
  constructor(errors: string[]) {
    super();
    this.message = `Input validation failed: ${errors.join(', ')}`;
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AccountAlreadyExistsError extends CustomError {
  public errorCode = 3009;
  public status = 400;
  constructor({ organisationId, accountType }: AccountParams) {
    super();
    this.message = `Account creation failed: account '${organisationId}:${accountType}' already exists`;
    this.name = 'AccountAlreadyExistsError';
  }
}
