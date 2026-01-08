import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../lib/multiplayerState';

interface DiscussionChatProps {
  messages: ChatMessage[];
  currentPlayerId: string;
  currentPlayerName: string;
  onSendMessage: (message: string) => void;
  onSendReaction: (emoji: string) => void;
  disabled?: boolean;
}

const QUICK_REACTIONS = ['👀', '✅', '⚠️', '❓', '🎯', '💀'];

export function DiscussionChat({
  messages,
  currentPlayerId,
  currentPlayerName,
  onSendMessage,
  onSendReaction,
  disabled = false,
}: DiscussionChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;
    onSendMessage(inputValue);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReaction = (emoji: string) => {
    if (disabled) return;
    onSendReaction(emoji);
  };

  // Get player color based on ID (deterministic)
  const getPlayerColor = (playerId: string) => {
    const colors = [
      '#a78bfa', // purple
      '#60a5fa', // blue
      '#34d399', // green
      '#fbbf24', // yellow
      '#f87171', // red
      '#fb923c', // orange
      '#ec4899', // pink
      '#14b8a6', // teal
    ];
    const hash = playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.2) 0%, rgba(30, 30, 60, 0.4) 100%)',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.4) 0%, rgba(30, 30, 60, 0.6) 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
      }}>
        <div style={{
          color: '#d4af37',
          fontSize: '14px',
          fontWeight: '600',
          letterSpacing: '0.05em',
          textShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
          fontFamily: 'Georgia, serif',
        }}>
          💬 Discussion
        </div>
        <div style={{
          color: '#cbd5e1',
          fontSize: '11px',
          marginTop: '2px',
        }}>
          Discuss suspicions and alibis
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {messages.length === 0 && (
          <div style={{
            color: '#94a3b8',
            fontSize: '13px',
            textAlign: 'center',
            marginTop: '20px',
            fontStyle: 'italic',
          }}>
            No messages yet. Start the discussion!
          </div>
        )}
        
        {messages.map((msg) => {
          const isOwnMessage = msg.playerId === currentPlayerId;
          const playerColor = getPlayerColor(msg.playerId);

          if (msg.type === 'reaction') {
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: 'center',
                  background: 'rgba(30, 30, 60, 0.3)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: '#cbd5e1',
                }}
              >
                <span style={{ color: playerColor, fontWeight: '600' }}>
                  {msg.playerName}
                </span>
                {' '}
                <span style={{ fontSize: '16px' }}>{msg.message}</span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
              }}
            >
              <div style={{
                fontSize: '11px',
                color: playerColor,
                fontWeight: '600',
                marginBottom: '2px',
                marginLeft: isOwnMessage ? '0' : '8px',
                marginRight: isOwnMessage ? '8px' : '0',
                textAlign: isOwnMessage ? 'right' : 'left',
              }}>
                {isOwnMessage ? 'You' : msg.playerName}
              </div>
              <div style={{
                background: isOwnMessage
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(76, 29, 149, 0.5) 100%)'
                  : 'rgba(30, 30, 60, 0.6)',
                border: `1px solid ${isOwnMessage ? 'rgba(139, 92, 246, 0.4)' : 'rgba(100, 100, 150, 0.3)'}`,
                borderRadius: isOwnMessage ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '8px 12px',
                color: '#e9d5ff',
                fontSize: '13px',
                lineHeight: '1.4',
                wordBreak: 'break-word',
              }}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            disabled={disabled}
            style={{
              background: 'rgba(30, 30, 60, 0.5)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '16px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 30, 60, 0.5)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'flex',
        gap: '8px',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder={disabled ? 'Chat disabled' : 'Type a message...'}
          maxLength={200}
          style={{
            flex: 1,
            background: 'rgba(30, 30, 60, 0.6)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '6px',
            padding: '10px 12px',
            color: '#e9d5ff',
            fontSize: '13px',
            outline: 'none',
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
          style={{
            background: (!disabled && inputValue.trim())
              ? 'linear-gradient(135deg, #d4af37, #b8941f)'
              : 'rgba(60, 50, 80, 0.4)',
            color: (!disabled && inputValue.trim()) ? 'rgba(20, 15, 10, 0.95)' : 'rgba(148, 163, 184, 0.5)',
            border: `1px solid ${(!disabled && inputValue.trim()) ? 'rgba(212, 175, 55, 0.5)' : 'rgba(100, 100, 150, 0.3)'}`,
            borderRadius: '6px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: (!disabled && inputValue.trim()) ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
