import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { api } from '@/lib/apiBase';
import { API_URL } from '@/constants';
import { $keyPair, $token, authFx, logOut } from '@/model/user';

type RequestConfigWithRetry = InternalAxiosRequestConfig & {
    _retry?: boolean;
    skipAuth?: boolean;
};

function isAuthRequest(config?: { url?: string }) {
    const url = config?.url ?? '';
    try {
        return new URL(url, API_URL).pathname.endsWith('/auth');
    } catch {
        // Covers "/auth" and also possible "auth" without leading slash.
        return url === '/auth' || url.endsWith('/auth') || url === 'auth';
    }
}

let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const keyPair = $keyPair.getState();
        if (!keyPair) {
            throw new Error('No keyPair available for auth refresh');
        }

        const result = await authFx(keyPair);
        const token = result?.token;

        if (!token) {
            throw new Error('Auth refresh did not return token');
        }

        return token;
    })();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}

api.interceptors.request.use((config) => {
    const cfg = config as RequestConfigWithRetry;
    if (cfg.skipAuth || isAuthRequest(cfg)) return cfg;

    const token = $token.getState();
    if (!token) return cfg;

    cfg.headers = cfg.headers ?? {};
    // @ts-expect-error axios headers typing is too strict here
    cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalConfig = error.config as RequestConfigWithRetry | undefined;

        // If we don't have a config to retry — just throw.
        if (!originalConfig) {
            throw error;
        }

        // Never try to refresh on auth call itself.
        if (originalConfig.skipAuth || isAuthRequest(originalConfig)) {
            throw error;
        }

        // Refresh flow for 401.
        if (status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;

            try {
                const newToken = await refreshToken();
                originalConfig.headers = originalConfig.headers ?? {};
                // @ts-expect-error axios headers typing is too strict here
                originalConfig.headers.Authorization = `Bearer ${newToken}`;
                return api.request(originalConfig);
            } catch (e) {
                const refreshErr = e as AxiosError | Error;
                const refreshStatus =
                    refreshErr && typeof refreshErr === 'object' && 'response' in refreshErr
                        ? (refreshErr as AxiosError).response?.status
                        : undefined;

                // If auth refresh was rejected by server — drop local session.
                if (refreshStatus === 401 || refreshStatus === 403) {
                    logOut();
                }

                throw error;
            }
        }

        throw error;
    },
);

export { api };
