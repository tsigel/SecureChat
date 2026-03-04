export type CustomError<T extends string, E = any> = {
    type: T;
    error: E
};

export const make = <T extends string>(type: T) =>
    (error: any): CustomError<T> => ({ type, error });
