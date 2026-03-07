import axios from 'axios';
import { API_URL } from '@/constants';

// Без interceptors: используется для публичных запросов (например /auth)
export const publicApi = axios.create({
    baseURL: API_URL,
});

// С interceptors: подключается через src/lib/apiClient.ts
export const api = axios.create({
    baseURL: API_URL,
});
