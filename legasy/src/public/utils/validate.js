import { err, ok } from 'neverthrow';
const isFn = (data) => typeof data === 'function';
const resolveLazy = (some) => {
    return isFn(some)
        ? some()
        : some;
};
export const validate = (lazy, data) => {
    const schema = resolveLazy(lazy);
    const result = schema.safeParse(data);
    if (result.error) {
        return err(result.error);
    }
    return ok(result.data);
};
//# sourceMappingURL=validate.js.map