import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './globals.css';
import { registerServiceWorker } from "./serviceWorkerRegistration";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// Service Worker нужен и в dev для тестирования пушей (требуется HTTPS/localhost).
// При необходимости его можно отключить через VITE_DISABLE_SW=true.
const shouldRegisterSw = import.meta.env.VITE_DISABLE_SW !== "true";

if (shouldRegisterSw) {
    void registerServiceWorker().match(
        () => undefined,
        () => undefined,
    );
}

