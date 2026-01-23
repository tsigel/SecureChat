export const parseFetchResponse = <T>(r: Response): Promise<T> => {
    if (!r.ok) {
        return r.text().then((message) => {
            return Promise.reject({
                message, response: r
            });
        });
    }
    if (r.status === 204) {
        return Promise.resolve(void 0) as Promise<T>;
    }
    if (r.headers.get('Content-Type')?.toLowerCase().includes('application/json')) {
        return r.json() as Promise<T>;
    }
    return r.text() as Promise<T>;
};
