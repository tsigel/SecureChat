import { useCallback, useState } from 'react'

import { generateSeed } from '@/utils/seedHelpers'
import { ConfirmSeed } from '@/components/auth/ConfirmSeed'
import { GenerateSeed } from '@/components/auth/GenerateSeed'

type OnboardingStep = 'generate' | 'confirm'

interface OnboardingFlowProps {
    onCancel?: () => void;
    onComplete?: () => void;
}

export function SignupPage({ onCancel, onComplete }: OnboardingFlowProps) {
    const [step, setStep] = useState<OnboardingStep>('generate');
    const [seedPhrase, setSeedPhrase] = useState<string[]>(generateSeed().split(' '));

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

    return <ConfirmSeed seedPhrase={seedPhrase} onBack={handleBackToGenerate} onComplete={onComplete} />;
}
