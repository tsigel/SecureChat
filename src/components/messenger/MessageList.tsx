import { useCallback, useEffect, useRef } from 'react';
import { HashAvatar } from '@/components/common/HashAvatar';
import { useGate, useUnit } from 'effector-react';
import { $selectedContact } from '@/model/contacts';
import { $messages, MessagesGate } from '@/model/messages';
import { Message, MessageDirection } from '@/storage';
import { $keyPair } from '@/model/user';
import { decodeText, decrypt } from '@/lib/crypto';
import sodium from 'libsodium-wrappers';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatTime = useCallback((date: number) => {
        return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }, []);

    if (!contact) {
        return null;
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-4">
                {messages.map((message) => (
                    <MessageItem key={message.id}
                                 message={message}
                                 formatTime={formatTime}
                                 contactName={contact.name}
                                 contactHash={contact.id}/>
                ))}
                <div ref={messagesEndRef}/>
            </div>
        </div>
    );
};
