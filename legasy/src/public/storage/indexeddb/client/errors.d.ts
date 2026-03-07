import { AppError } from '@/error';
export declare class CantOpenDbError extends AppError<'cant-open-db'> {
    readonly kind = "cant-open-db";
    constructor(message: string);
}
export declare class IndexDbBlockedError extends AppError<'index-db-blocked'> {
    readonly kind = "index-db-blocked";
    constructor(message: string);
}
