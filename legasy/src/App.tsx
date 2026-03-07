import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MessengerPage } from './pages/MessengerPage';
import { SignupPage } from './pages/SignupPage';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { $hasUser } from '@/model/user';
import { useUnit } from 'effector-react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { initialize } from '@/bus/runtime/service';
import { Fragment } from 'react';
import { EnablePushDialog } from '@/components/push/EnablePushDialog';

initialize()
    .orTee(e => {
        console.error(e);
    });

export default function App() {
    return (
        <Fragment>
            <Routes>
                <Route path="/" element={<LandingRoute/>}/>
                <Route path="/auth/signup" element={<SignupRoute/>}/>
                <Route path="/auth/login" element={<LoginRoute/>}/>
                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <MessengerPage/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/app/chat/:contactId"
                    element={
                        <ProtectedRoute>
                            <MessengerPage/>
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
            <EnablePushDialog/>
        </Fragment>
    );
}

function LandingRoute() {
    const navigate = useNavigate();
    const hasUser = useUnit($hasUser);

    if (hasUser) return <Navigate to="/app" replace/>;

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

    if (hasUser) return <Navigate to="/app" replace/>;

    return <SignupPage onCancel={() => navigate('/')} onComplete={() => navigate('/app')}/>;
}

function LoginRoute() {
    const navigate = useNavigate();
    const hasUser = useUnit($hasUser);

    if (hasUser) return <Navigate to="/app" replace/>;

    return <LoginPage onBack={() => navigate('/')} onLogin={() => navigate('/app')}/>;
}
