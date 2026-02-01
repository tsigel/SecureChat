import axios from 'axios';

export function isNetworkError(error: unknown): boolean {
    // Axios network error: no response (request didn't reach server / no internet / CORS / DNS)
    if (axios.isAxiosError(error)) {
        return !error.response;
    }

    // Fallback for other thrown types
    if (error && typeof error === 'object' && 'message' in error) {
        const msg = String((error as any).message ?? '');
        return /network|failed to fetch|timeout|load failed/i.test(msg);
    }

    return false;
}
