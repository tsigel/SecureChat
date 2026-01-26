import { useCallback, useState } from 'react'

import { generateSeed } from '@/utils/seedHelpers'
import { ConfirmSeed } from '@/components/auth/ConfirmSeed'
import { GenerateSeed } from '@/components/auth/GenerateSeed'
import { CreateName } from '@/components/auth/CreateName'
import { CreatePassword } from '@/components/auth/CreatePassword'

type OnboardingStep = 'generate' | 'confirm' | 'create_name' | 'create_password'

interface OnboardingFlowProps {
    onCancel?: () => void;
    onComplete?: () => void;
}

export function SignupPage({ onCancel, onComplete }: OnboardingFlowProps) {
    const [step, setStep] = useState<OnboardingStep>('generate');
    const [seedPhrase, setSeedPhrase] = useState<string[]>(generateSeed().split(' '));
    const [userName, setUserName] = useState('');

    const updateSeedPhrase = useCallback((seed: string[]) => {
        setSeedPhrase(seed);
    }, []);

    const handleRegenerateSeed = useCallback(() => {
        updateSeedPhrase(generateSeed().split(' '));
    }, []);

    const handleConfirmSeed = useCallback(() => {
        setStep('confirm');
    }, []);

    const handleBackToGenerate = useCallback(() => {
        setStep('generate');
    }, []);

    const handleNameCreation = useCallback(() => {
        setStep('create_name');
    }, []);

    const handleBackToConfirm = useCallback(() => {
        setStep('confirm');
    }, []);

    const handleNameNext = useCallback((name: string) => {
        setUserName(name);
        setStep('create_password');
    }, []);

    const handleBackToName = useCallback(() => {
        setStep('create_name');
    }, []);

    if (seedPhrase.length === 0) {
        return null; // Or a loading spinner
    }

    if (step === 'generate') {
        return (
            <GenerateSeed
                seedPhrase={seedPhrase}
                onNext={handleConfirmSeed}
                onSeedChange={updateSeedPhrase}
                onRegenerate={handleRegenerateSeed}
                onCancel={onCancel}
            />
        );
    }

    if (step === 'confirm') {
        return (
            <ConfirmSeed
                seedPhrase={seedPhrase}
                onBack={handleBackToGenerate}
                onComplete={handleNameCreation}
            />
        );
    }

    if (step === 'create_name') {
        return (
            <CreateName
                seed={seedPhrase.join(' ')}
                onBack={handleBackToConfirm}
                onNext={handleNameNext}
            />
        );
    }

    return (
        <CreatePassword
            seed={seedPhrase.join(' ')}
            name={userName}
            onBack={handleBackToName}
            onComplete={onComplete ?? (() => {})}
        />
    );
}
