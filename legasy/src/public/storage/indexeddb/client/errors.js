import { AppError } from '@/error';
export class CantOpenDbError extends AppError {
    constructor(message) {
        super(`CantOpenDBError: ${message}`);
        this.kind = 'cant-open-db';
    }
}
export class IndexDbBlockedError extends AppError {
    constructor(message) {
        super(`IndexDbBlockedError: ${message}`);
        this.kind = 'index-db-blocked';
    }
}
//# sourceMappingURL=errors.js.map