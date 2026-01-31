import { useCallback, useEffect, useRef } from 'react';
import { HashAvatar } from '@/components/common/HashAvatar';
import { useGate, useUnit } from 'effector-react';
import { $selectedContact } from '@/model/contacts';
import { $messages, markMessageAsRead, MessagesGate } from '@/model/messages';
import { Message, MessageDirection } from '@/storage';
import { $keyPair } from '@/model/user';
import { decodeText, decrypt } from '@/lib/crypto';
import sodium from 'libsodium-wrappers';
import { $soundEnabled } from '@/model/settings';

function useMessageReadTracking(params: {
    containerRef: React.RefObject<HTMLElement | null>;
    messages: Message[];
    enabled: boolean;
    onRead: (messageId: string) => void;
    threshold?: number;
    minVisibleMs?: number;
}) {
    const {
        containerRef,
        messages,
        enabled,
        onRead,
        threshold = 0.7,
        minVisibleMs = 1200,
    } = params;

    const firedRef = useRef<Set<string>>(new Set());
    const timersRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const root = containerRef.current;
        if (!root) {
            return;
        }

        const clearTimer = (id: string) => {
            const t = timersRef.current.get(id);
            if (t != null) {
                window.clearTimeout(t);
                timersRef.current.delete(id);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            const isActive = document.hasFocus() && !document.hidden;

            for (const entry of entries) {
                const el = entry.target as HTMLElement;
                const id = el.dataset.messageId;
                if (!id) continue;

                // если уже отправили — больше не трекаем
                if (firedRef.current.has(id)) {
                    clearTimer(id);
                    continue;
                }

                // если элемент ушёл из видимости или вкладка неактивна — отменяем таймер
                if (!isActive || !entry.isIntersecting || entry.intersectionRatio < threshold) {
                    clearTimer(id);
                    continue;
                }

                // уже ждём minVisibleMs
                if (timersRef.current.has(id)) {
                    continue;
                }

                const handle = window.setTimeout(() => {
                    timersRef.current.delete(id);

                    // повторная проверка на момент срабатывания
                    if (!document.hasFocus() || document.hidden) {
                        return;
                    }
                    if (firedRef.current.has(id)) {
                        return;
                    }

                    firedRef.current.add(id);
                    onRead(id);
                }, minVisibleMs);

                timersRef.current.set(id, handle);
            }
        }, { root, threshold });

        const idsToObserve = messages
            .filter((m) => m.direction === MessageDirection.Incoming && !m.readAt)
            .map((m) => m.id);

        for (const id of idsToObserve) {
            const el = root.querySelector<HTMLElement>(`[data-message-id="${id}"]`);
            if (el) {
                observer.observe(el);
            }
        }

        return () => {
            observer.disconnect();
            for (const t of timersRef.current.values()) {
                window.clearTimeout(t);
            }
            timersRef.current.clear();
        };
    }, [containerRef, enabled, messages, minVisibleMs, onRead, threshold]);
}

const MessageItem = ({
    message,
    formatTime,
    contactName,
    contactHash,
}: {
    message: Message
    formatTime: (date: number) => string
    contactName: string
    contactHash: string
}) => {
    const keyPair = useUnit($keyPair);

    const text = decodeText(decrypt(message.encrypted, sodium.from_hex(contactHash), keyPair!));

    return (
        <div
            data-message-id={message.id}
            className={`flex items-start gap-3 ${message.direction === MessageDirection.Outgoing ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {message.direction === MessageDirection.Incoming && (
                <HashAvatar
                    hash={contactHash}
                    name={contactName}
                    className="h-8 w-8 shrink-0"
                />
            )}

            <div
                className={`flex flex-col gap-1 max-w-[70%] ${message.direction == MessageDirection.Outgoing ? 'items-end' : 'items-start'}`}
            >
                <div
                    className={`px-4 py-2.5 rounded-2xl ${message.direction == MessageDirection.Outgoing
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-neutral-800 text-card-foreground rounded-tl-sm'
                        }`}
                >
                    <p className="text-sm leading-relaxed">{text}</p>
                </div>
                <span className="text-xs text-muted-foreground px-2">{formatTime(message.createdAt)}</span>
            </div>
        </div>
    );
};

export const MessageList = () => {
    useGate(MessagesGate);

    const messages: Array<Message> = useUnit($messages);
    const contact = useUnit($selectedContact);
    const soundEnabled = useUnit($soundEnabled);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markRead = useUnit(markMessageAsRead);
    const lastIncomingIdRef = useRef<string | null>(null);
    const initializedRef = useRef(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastContactIdRef = useRef<string | null>(null);

    const prevMessageCountRef = useRef(0);

    useEffect(() => {
        const prevCount = prevMessageCountRef.current;
        prevMessageCountRef.current = messages.length;

        // Скроллим только когда добавлено новое сообщение, а не при обновлении статусов
        if (messages.length <= prevCount) {
            return;
        }

        messagesEndRef.current?.scrollIntoView(
            prevCount === 0 ? { behavior: 'instant' } : { behavior: 'smooth' }
        );
    }, [messages]);

    // Инициализация аудио-объекта один раз
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/notification.mp3');
        }
    }, []);

    // Воспроизведение звука при появлении нового входящего сообщения
    useEffect(() => {
        if (!messages.length || !contact) {
            return;
        }

        const lastIncoming = [...messages]
            .filter((m) => m.direction === MessageDirection.Incoming)
            .sort((a, b) => a.createdAt - b.createdAt)
            .at(-1);

        // При смене контакта не считаем сообщения "новыми" и не играем звук
        // Просто запоминаем последнее входящее сообщение для этого контакта.
        if (lastContactIdRef.current !== contact.id) {
            lastContactIdRef.current = contact.id;
            lastIncomingIdRef.current = lastIncoming?.id ?? null;
            initializedRef.current = true;
            return;
        }

        if (!lastIncoming) {
            return;
        }

        // пропускаем первый рендер глобально, чтобы не было звука при самом первом открытии приложения
        if (!initializedRef.current) {
            initializedRef.current = true;
            lastIncomingIdRef.current = lastIncoming.id;
            return;
        }

        if (lastIncoming.id !== lastIncomingIdRef.current) {
            lastIncomingIdRef.current = lastIncoming.id;
            // пробуем воспроизвести звук; ошибки (блокировка автоплея) игнорируем
            if (soundEnabled) {
                void audioRef.current?.play().catch(() => { });
            }
        }
    }, [messages, contact, soundEnabled]);

    const formatTime = useCallback((date: number) => {
        return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }, []);

    if (!contact) {
        return null;
    }

    useMessageReadTracking({
        containerRef,
        messages,
        enabled: true,
        onRead: markRead,
    });

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-4">
                {messages.map((message) => (
                    <MessageItem key={message.id}
                        message={message}
                        formatTime={formatTime}
                        contactName={contact.name}
                        contactHash={contact.id} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};
