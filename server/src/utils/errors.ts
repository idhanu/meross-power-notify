

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
