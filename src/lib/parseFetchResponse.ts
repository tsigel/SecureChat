export const parseFetchResponse = <T>(r: Response): Promise<T> =>
    r.ok
        ? r.json() as Promise<T>
        : r.text().then((text) => {
            return Promise.reject({
                message: text,
                response: r
            });
        });




