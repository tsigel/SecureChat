import { err, ok, Result } from 'neverthrow';

export type ParseError = {
    error: Error
    kind: 'json-parse-error'
};

export const jsonParse = (data: string): Result<unknown, ParseError> => {
    try {
        return ok(JSON.parse(data));
    } catch (e) {
        return err({
            error: e as Error,
            kind: 'json-parse-error'
        });
    }
};

export const pushMessageJson = (push: PushMessageData): Result<unknown, ParseError> => {
    const text = push.text();
    return jsonParse(text);
};
