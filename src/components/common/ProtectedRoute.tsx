import type React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    hasUser: boolean;
    redirectTo?: string;
    children: React.ReactNode;
}

export function ProtectedRoute({
    hasUser,
    redirectTo = '/auth/login',
    children,
}: ProtectedRouteProps) {
    if (!hasUser) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
