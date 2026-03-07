import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        // Нужно чтобы nginx в Docker мог достучаться до dev-сервера
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,

        // Мы открываем приложение через https://cryptomsg.test (через nginx reverse-proxy),
        // поэтому dev-сервер должен разрешать этот Host header.
        allowedHosts: ['cryptomsg.test'],

        // HMR через домен/порт, по которому заходим в браузере (nginx проксирует WS)
        hmr: {
            host: 'cryptomsg.test',
            protocol: 'wss',
            // Важно при reverse-proxy: клиент подключается к WSS на 443 (nginx),
            // при этом сам dev-сервер продолжает слушать 5173.
            clientPort: 443,
        },
    },
});
