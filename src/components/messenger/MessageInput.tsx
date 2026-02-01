import type React from 'react';
import { useCallback, useState } from 'react';
import { Paperclip, Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { sendMessage } from '@/model/messages';
import { useUnit } from 'effector-react';

const EMOJI_LIST = [
    '😀',
    '😂',
    '😍',
    '🥰',
    '😎',
    '🤔',
    '👍',
    '❤️',
    '🔥',
    '✨',
    '🎉',
    '💯',
    '👋',
    '🙏',
    '💪',
    '🤝',
];

export const MessageInput = () => {
    const localSendMessage = useUnit(sendMessage);
    const [message, setMessage] = useState('');

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (message.trim()) {
                localSendMessage(message.trim());
                setMessage('');
            }
        },
        [message],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim()) {
                    localSendMessage(message.trim());
                    setMessage('');
                }
            }
        },
        [message],
    );

    const insertEmoji = useCallback((emoji: string) => {
        setMessage((prev) => prev + emoji);
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="bg-card">
            <div className="p-4 pt-1">
                <div className="flex items-end gap-2 bg-secondary rounded-2xl px-3 py-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 hover:bg-muted/50"
                    >
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>

                    <Textarea
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Написать сообщение..."
                        className="min-h-[36px] max-h-32 resize-none bg-transparent border-0 focus-visible:ring-0 py-2 px-0"
                        rows={1}
                    />

                    <div className="flex items-center gap-1 shrink-0">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-muted/50"
                                >
                                    <Smile className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" align="end">
                                <div className="grid grid-cols-8 gap-1">
                                    {EMOJI_LIST.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => insertEmoji(emoji)}
                                            className="h-8 w-8 flex items-center justify-center text-lg hover:bg-muted rounded cursor-pointer"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            type="submit"
                            size="icon"
                            disabled={!message.trim()}
                            className="shrink-0 h-8 w-8 bg-[oklch(0.696_0.17_162.48)] hover:bg-[oklch(0.646_0.17_162.48)] text-white rounded-full"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};
