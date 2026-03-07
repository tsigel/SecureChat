import { Schema, ZodError } from 'zod';
import { Result } from 'neverthrow';
export type SchemaResolve<O, I> = Schema<O, I> | (() => Schema<O, I>);
export type Func<Args extends Array<any>, Return> = (...args: Args) => Return;
export declare const validate: <O, I>(lazy: SchemaResolve<O, I>, data: unknown) => Result<O, ZodError<O>>;
