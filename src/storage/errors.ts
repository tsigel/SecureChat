import { AppError, UnknownError } from '@/error';
import { OpenDbError } from '@/storage/indexeddb/client';

export class NotFoundError extends AppError<'not-found'> {
    public readonly kind = 'not-found' as const;

    public constructor(error: string | Error) {
        super(`Not found: ${typeof error === 'string' ? error : error.message}`);

        if (typeof error === 'object' && error.stack) {
            this.stack = error.stack;
        }
    }
}

export class ValidationError extends AppError<'validation'> {
    public readonly kind = 'validation' as const;

    public constructor(error: string | Error) {
        super(`Validation error: ${typeof error === 'string' ? error : error.message}`);

        if (typeof error === 'object' && error.stack) {
            this.stack = error.stack;
        }
    }
}

export class SerializationError extends AppError<'serialization'> {
    public readonly kind = 'serialization' as const;

    public constructor(error: string | Error) {
        super(`Serialization error: ${typeof error === 'string' ? error : error.message}`);

        if (typeof error === 'object' && error.stack) {
            this.stack = error.stack;
        }
    }
}

export type StorageError =
    | OpenDbError
    | NotFoundError
    | ValidationError
    | SerializationError
    | UnknownError;

export function makeValidationError(error: unknown): ValidationError {
    if (error instanceof Error) return new ValidationError(error);
    if (typeof error === 'string') return new ValidationError(error);
    return new ValidationError(String(error));
}

export function makeSerializationError(error: unknown): SerializationError {
    if (error instanceof Error) return new SerializationError(error);
    if (typeof error === 'string') return new SerializationError(error);
    return new SerializationError(String(error));
}
