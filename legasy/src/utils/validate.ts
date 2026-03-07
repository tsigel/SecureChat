import { Schema, ZodError } from 'zod'
import { Result, err, ok } from 'neverthrow';

export type SchemaResolve<O, I> = Schema<O, I> | (() => Schema<O, I>);

export type Func<Args extends Array<any>, Return> = (...args: Args) => Return;

const isFn = <Args extends Array<any>, Res>(data: unknown): data is Func<Args, Res> =>
    typeof data === 'function';

const resolveLazy = <T>(some: T | Func<[], T>): T => {
    return isFn(some)
        ? some()
        : some;
};

export const validate = <O, I>(lazy: SchemaResolve<O, I>, data: unknown): Result<O, ZodError<O>> => {
    const schema: Schema<O, I> = resolveLazy(lazy);
    const result = schema.safeParse(data);

    if (result.error) {
        return err(result.error);
    }

    return ok(result.data);
};
