import { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

interface ChatPanelProps {
  messages: any[];
  onSendMessage: (msg: string) => void;
  name: string;
}

export default function ChatPanel({ messages = [], onSendMessage, name }: ChatPanelProps) {
  const [text, setText] = useState('');
  const safeMessages = Array.isArray(messages) ? messages : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 text-slate-100">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-sky-400" />
        <h2 className="font-semibold text-sm">Meeting Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {safeMessages.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No messages yet. Start the conversation!</p>
        ) : (
          safeMessages.map((msg, idx) => {
            if (!msg) return null;
            const sender = msg.sender_name || 'User';
            const isMe = sender === name;

            return (
              <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-400 mb-1">{sender}</span>
                <div
                  className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] break-words ${
                    isMe
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                  }`}
                >
                  {msg.message || ''}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
