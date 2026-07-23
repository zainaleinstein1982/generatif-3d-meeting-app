import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '@/lib/supabase';

type Props = {
  messages: ChatMessage[];
  currentName: string;
  onSend: (content: string) => void;
};

export default function ChatPanel({ messages, currentName, onSend }: Props) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <MessageSquare className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">Chat</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m) => {
          const isMe = m.participant_name === currentName;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="mb-0.5 text-xs text-slate-500">{m.participant_name}</span>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  isMe
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-slate-100'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No messages yet. Start the conversation!
          </p>
        )}
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={handleSend}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-white transition hover:bg-cyan-400"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
