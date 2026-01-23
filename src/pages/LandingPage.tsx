"use client"

import type React from "react"

import { Lock, Shield, Key, MessageSquare, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SpinIcon } from "@/components/ui/SpinIcon"

interface LandingPageProps {
  onCreateAccount: () => void
  onLogin: () => void
}

export function LandingPage({ onCreateAccount, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <SpinIcon width={38} height={32} className="shrink-0" />
              <span className="text-lg font-semibold">SecureChat</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onLogin}
                className="text-neutral-400 hover:text-white hover:bg-neutral-900"
              >
                Войти
              </Button>
              <Button onClick={onCreateAccount} className="bg-white text-black hover:bg-neutral-200">
                Начать
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[oklch(0.696_0.17_162.48/0.1)] border border-[oklch(0.696_0.17_162.48/0.5)] rounded-full text-[oklch(0.696_0.17_162.48)] text-sm mb-6">
              <Lock className="w-3 h-3" />
              <span>Защита на уровне криптокошелька</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance">
              Мессенджер с полным контролем над данными
            </h1>

            <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto text-pretty">
              Общайтесь безопасно. Только вы имеете доступ к своим сообщениям благодаря seed-фразе из 12 слов. Никаких
              серверов, никаких утечек.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onCreateAccount}
                className="w-full sm:w-auto h-12 px-8 bg-white text-black hover:bg-neutral-200 text-base font-medium"
              >
                Создать аккаунт
              </Button>
              <Button
                onClick={onLogin}
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-900 hover:text-white text-base font-medium"
              >
                Войти по seed-фразе
              </Button>
            </div>

            {/* Visual Demo */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-neutral-600/10 blur-3xl rounded-full" />
              <div className="relative bg-neutral-950 border border-neutral-800 rounded-2xl p-8 max-w-3xl mx-auto">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    "forest",
                    "ocean",
                    "mountain",
                    "river",
                    "cloud",
                    "thunder",
                    "sunset",
                    "winter",
                    "spring",
                    "summer",
                    "autumn",
                    "moon",
                  ].map((word, i) => (
                    <div
                      key={i}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-center text-sm font-mono"
                    >
                      {word}
                    </div>
                  ))}
                </div>
                <p className="text-neutral-500 text-sm">Пример seed-фразы из 12 слов</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Безопасность на первом месте</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Криптографическая защита вашей приватности с технологией seed-фраз
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Key className="w-6 h-6" />}
              title="Seed-фраза контроль"
              description="Только вы владеете ключом доступа. Храните 12 слов в безопасности — это единственный способ войти в аккаунт."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Без централизации"
              description="Никаких серверов с вашими данными. Полная децентрализация и независимость от третьих сторон."
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="End-to-end шифрование"
              description="Все сообщения зашифрованы. Только отправитель и получатель могут прочитать контент."
            />
            <FeatureCard
              icon={<Eye className="w-6 h-6" />}
              title="Нулевое знание"
              description="Мы не имеем доступа к вашим данным. Даже если бы хотели — технически это невозможно."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Приватные чаты"
              description="Общайтесь один на один или в группах с полной уверенностью в конфиденциальности."
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Минималистичный UI"
              description="Современный темный интерфейс без отвлекающих элементов. Фокус на общении."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Начните безопасное общение</h2>
            <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
              Создайте аккаунт за 2 минуты. Запомните seed-фразу и получите полный контроль над своими данными.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onCreateAccount}
                className="w-full sm:w-auto h-12 px-8 bg-neutral-600 hover:bg-neutral-700 text-white text-base font-medium"
              >
                Создать аккаунт
              </Button>
              <Button
                onClick={onLogin}
                variant="ghost"
                className="w-full sm:w-auto h-12 px-8 text-neutral-400 hover:text-white hover:bg-neutral-900"
              >
                Уже есть аккаунт?
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SpinIcon width={38} height={32} className="shrink-0" />
              <span className="text-lg font-semibold">SecureChat</span>
            </div>
            <p className="text-neutral-500 text-sm">© 2025 SecureChat. Защищенное общение для всех.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
      <div className="w-12 h-12 bg-[oklch(0.696_0.17_162.48/0.1)] border border-[oklch(0.696_0.17_162.48/0.3)] rounded-xl flex items-center justify-center text-[oklch(0.696_0.17_162.48)] mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
