import { AppError } from '@/error';
export class NotFoundError extends AppError {
    constructor(error) {
        super(`Not found: ${typeof error === 'string' ? error : error.message}`);
        this.kind = 'not-found';
        if (typeof error === 'object' && error.stack) {
            this.stack = error.stack;
        }
    }
}
export class ValidationError extends AppError {
    constructor(error) {
        super(`Validation error: ${typeof error === 'string' ? error : error.message}`);
        this.kind = 'validation';
        if (typeof error === 'object' && error.stack) {
            this.stack = error.stack;
        }
    }
}
export class SerializationError extends AppError {
    constructor(error) {
        super(`Serialization error: ${typeof error === 'string' ? error : error.message}`);
        this.kind = 'serialization';
        if (typeof error === 'object' && error.stack) {
            this.stack = error.stack;
        }
    }
}
export function makeValidationError(error) {
    if (error instanceof Error)
        return new ValidationError(error);
    if (typeof error === 'string')
        return new ValidationError(error);
    return new ValidationError(String(error));
}
export function makeSerializationError(error) {
    if (error instanceof Error)
        return new SerializationError(error);
    if (typeof error === 'string')
        return new SerializationError(error);
    return new SerializationError(String(error));
}
//# sourceMappingURL=errors.js.map