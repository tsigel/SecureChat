import { Result, ResultAsync } from 'neverthrow';

export const fromResult = <T>(result: Result<T, any>): Promise<never> | T =>
    result.isErr()
        ? Promise.reject(result.error)
        : result.value;

export const fromAsyncResult = <T>(data: ResultAsync<T, any>): PromiseLike<T> =>
    data.then(fromResult)
