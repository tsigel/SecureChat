export abstract class AppError<T extends string> extends Error {
    public abstract readonly kind: T;
    public readonly message: string;

    public constructor(message: string) {
        super(message);
        this.message = message;

        // Ensure correct prototype chain for subclasses (instanceof works).
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class UnknownError extends AppError<'unknown-error'> {
    public readonly kind = 'unknown-error';

    public constructor(error: unknown) {
        if (error instanceof AppError) {
            return error;
        }

        const parsed = parseError(error);

        super(`Unknown error: ${parsed.message}`);

        if (parsed.stack) {
            this.stack = parsed.stack;
        }
    }
}

function parseError(e: unknown): { message: string; stack?: string } {
    switch (typeof e) {
        case 'object':
            if (e == null) {
                return { message: 'null' };
            } else if (e instanceof Error) {
                return { message: e.message, stack: e.stack };
            } else {
                return { message: JSON.stringify(e) };
            }
        default:
            return { message: String(e) };
    }
}
