export type CustomError<Kind extends string> = {
    type: Kind,
    error: any;
}
