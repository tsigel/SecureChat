import { AppError } from '@/error';

export class CantOpenDbError extends AppError<'cant-open-db'> {
    public readonly kind = 'cant-open-db';

    constructor(message: string) {
        super(`CantOpenDBError: ${message}`);
    }
}

export class IndexDbBlockedError extends AppError<'index-db-blocked'> {
    public readonly kind = 'index-db-blocked';

    constructor(message: string) {
        super(`IndexDbBlockedError: ${message}`);
    }
}
