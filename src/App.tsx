import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MessengerPage } from './pages/MessengerPage';
import { SignupPage } from './pages/SignupPage';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { $hasUser } from '@/model/user';
import { useUnit } from 'effector-react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

export default function App() {
    const hasUser = useUnit($hasUser);

    return (
        <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route path="/auth/signup" element={<SignupRoute />} />
            <Route path="/auth/login" element={<LoginRoute />} />
            <Route
                path="/app"
                element={
                    <ProtectedRoute hasUser={hasUser}>
                        <MessengerPage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function LandingRoute() {
    const navigate = useNavigate();
    const hasUser = useUnit($hasUser);

    if (hasUser) return <Navigate to="/app" replace />;

    return (
        <LandingPage
            onCreateAccount={() => navigate('/auth/signup')}
            onLogin={() => navigate('/auth/login')}
        />
    );
}

function SignupRoute() {
    const navigate = useNavigate();
    const hasUser = useUnit($hasUser);

    if (hasUser) return <Navigate to="/app" replace />;

    return <SignupPage onCancel={() => navigate('/')} onComplete={() => navigate('/app')} />;
}

function LoginRoute() {
    const navigate = useNavigate();
    const hasUser = useUnit($hasUser);

    if (hasUser) return <Navigate to="/app" replace />;

    return <LoginPage onBack={() => navigate('/')} onLogin={() => navigate('/app')} />;
}
