import { AppError, UnknownError } from '@/error';
import { OpenDbError } from '@/storage/indexeddb/client';
export declare class NotFoundError extends AppError<'not-found'> {
    readonly kind: "not-found";
    constructor(error: string | Error);
}
export declare class ValidationError extends AppError<'validation'> {
    readonly kind: "validation";
    constructor(error: string | Error);
}
export declare class SerializationError extends AppError<'serialization'> {
    readonly kind: "serialization";
    constructor(error: string | Error);
}
export type StorageError = OpenDbError | NotFoundError | ValidationError | SerializationError | UnknownError;
export declare function makeValidationError(error: unknown): ValidationError;
export declare function makeSerializationError(error: unknown): SerializationError;
