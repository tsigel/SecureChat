import type React from 'react';
import { Navigate } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { $hasUser } from '@/model/user';

interface ProtectedRouteProps {
    redirectTo?: string;
    children: React.ReactNode;
}

export function ProtectedRoute({
                                   redirectTo = '/auth/login',
                                   children,
                               }: ProtectedRouteProps) {
    const hasUser = useUnit($hasUser);

    if (!hasUser) {
        return <Navigate to={redirectTo} replace/>;
    }

    return <>{children}</>;
}
