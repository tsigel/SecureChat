import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
    // Для сборки воркера publicDir не нужен, иначе Vite ругается на совпадение с outDir.
    publicDir: false,
    build: {
        outDir: 'public',
        // Не трогаем остальные файлы в public (иконки, manifest и т.п.)
        emptyOutDir: false,
        sourcemap: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'src/sw.ts'),
            output: {
                format: 'es',
                entryFileNames: 'sw.js',
                chunkFileNames: 'sw-[name].js',
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                    return undefined;
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});


