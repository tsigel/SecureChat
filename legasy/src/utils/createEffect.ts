import { Result, ResultAsync } from 'neverthrow';
import { createEffect as createFx, Domain, Effect } from 'effector';

export type CreateEffectProps<Props, Data, Error> = {
    domain?: Domain;
    fn: (data: Props) => Result<Data, Error> | ResultAsync<Data, Error>;
}

type Response<Props, Data, Error> = Effect<Props, Data, Error>;

const isResultAsync = (data: unknown): data is ResultAsync<any, any> => {
    return typeof data === 'object' && data != null && 'then' in data && typeof data.then === 'function';
};

export const createEffect = <Props, Data, Error>(props: CreateEffectProps<Props, Data, Error>): Response<Props, Data, Error> => {
    const create = props.domain?.createEffect ?? createFx;

    const applySync = (res: Result<Data, Error>) => {
        if (res.isErr()) {
            throw res.error;
        }
        return res.value;
    }

    const applyAsync = (res: Result<Data, Error>) => {
        if (res.isErr()) {
            return Promise.reject(res.error);
        }
        return res.value;
    }

    return create((effectProps) => {
        const result = props.fn(effectProps);

        if (isResultAsync(result)) {
            return result.then(applyAsync);
        }
        return applySync(result)
    });
};
