export class StatusError extends Error {
  isUserError: boolean;
  status: number;
  details?: string[];
  originalStack?: any;

  constructor(
    message: string,
    status: number = 500,
    isUserError: boolean = false,
    details?: string[],
    originalStack?: any
  ) {
    super(message);
    this.status = status;
    this.details = details;
    this.isUserError = isUserError;
    this.originalStack = originalStack;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserError extends StatusError {
  constructor(
    message: string,
    status: number = 400,
    details?: string[],
    originalStack?: any
  ) {
    super(message, status, true, details, originalStack);
  }
}

export class InternalError extends StatusError {
  constructor(
    message: string,
    status: number = 500,
    details?: string[],
    originalStack?: any
  ) {
    super(message, status, false, details, originalStack);
  }
}

export type AppError = UserError | InternalError;
