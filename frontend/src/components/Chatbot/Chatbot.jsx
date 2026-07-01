import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Chatbot.css';

const Chatbot = () => {
    const navigate = useNavigate();
    const { fetchCart } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => {
        const existing = sessionStorage.getItem('chatbot_session_id');
        if (existing) return existing;
        const newSessionId = `customer_session_${Date.now()}`;
        sessionStorage.setItem('chatbot_session_id', newSessionId);
        return newSessionId;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Check authentication status
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        setIsAuthenticated(!!token && !!user);

        // Initial bot message
        const welcomeMessage = token && user
            ? "👋 Welcome back! I'm your food assistant! 🍕\n\nI can help you find delicious food, manage your cart, track orders, and more!\n\nWhat would you like to do today?"
            : "👋 Hi! I'm your food assistant! 🍕\n\nI can help you discover delicious food and navigate our app. Some features require login for full access.\n\nWhat would you like to explore?";

        setMessages([{
            id: 1,
            text: welcomeMessage,
            sender: 'bot',
            timestamp: new Date(),
            type: 'welcome'
        }]);
    }, [isAuthenticated]);

    const sendMessage = async (overrideMessage) => {
        const textToSend = overrideMessage || inputMessage;
        if (!textToSend.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: textToSend,
            sender: 'user',
            timestamp: new Date(),
            type: 'text'
        };

        setMessages(prev => [...prev, userMessage]);
        if (!overrideMessage) {
            setInputMessage('');
        }
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            const headers = {
                'Content-Type': 'application/json',
            };

            // Add authorization header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiURL}/api/chatbot/customer/message`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    message: textToSend,
                    sessionId,
                    userId: user?._id || user?.id || `guest_${Date.now()}`
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                let botText = data.response || '';
                
                // 1. Check for navigation request [NAVIGATE] /path
                const navMatch = botText.match(/\[NAVIGATE\]\s+([^\s]+)/);
                if (navMatch) {
                    const targetRoute = navMatch[1];
                    botText = botText.replace(/\[NAVIGATE\]\s+[^\s]+/, '').trim();
                    setTimeout(() => {
                        navigate(targetRoute);
                    }, 800);
                }

                // 2. Check for action trigger [ACTION] sync_cart
                if (botText.includes('[ACTION] sync_cart')) {
                    botText = botText.replace('[ACTION] sync_cart', '').trim();
                    if (fetchCart) {
                        fetchCart();
                    }
                }

                const botMessage = {
                    id: Date.now() + 1,
                    text: botText,
                    sender: 'bot',
                    timestamp: new Date(),
                    intent: data.intent,
                    confidence: data.confidence,
                    modelUsed: data.modelUsed,
                    type: 'text'
                };
                setMessages(prev => [...prev, botMessage]);
                
                // Update authentication status if changed
                if (data.isAuthenticated !== undefined) {
                    setIsAuthenticated(data.isAuthenticated);
                }
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "😅 Sorry, I'm having trouble responding. Please try again in a moment.",
                sender: 'bot',
                timestamp: new Date(),
                type: 'error'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickActions = [
        { 
            label: "🍕 Find Pizza", 
            message: "Find pizza",
            icon: "🍕"
        },
        { 
            label: "🍝 Italian", 
            message: "Show Italian food",
            icon: "🍝"
        },
        { 
            label: "🛒 View Cart", 
            message: "Show my cart",
            icon: "🛒",
            requiresAuth: true
        },
        { 
            label: "📦 Orders", 
            message: "Show my past orders",
            icon: "📦",
            requiresAuth: true
        },
        { 
            label: "🔍 Search", 
            message: "Find burgers",
            icon: "🔍"
        },
        { 
            label: "🏪 Restaurants", 
            message: "Show all restaurants",
            icon: "🏪"
        },
        { 
            label: "📍 Track Order", 
            message: "Track my order",
            icon: "📍",
            requiresAuth: true
        },
        { 
            label: "❓ Help", 
            message: "What can you do?",
            icon: "❓"
        }
    ];

    const handleQuickAction = (action) => {
        if (action.requiresAuth && !isAuthenticated) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "🔒 Please log in to access this feature. You can login from the main menu!",
                sender: 'bot',
                timestamp: new Date(),
                type: 'info'
            }]);
            return;
        }
        
        sendMessage(action.message);
    };

    const clearChat = () => {
        const welcomeMessage = isAuthenticated 
            ? "💬 Chat cleared! Welcome back! How can I help you with your food journey today?"
            : "💬 Chat cleared! How can I help you explore our food options today?";

        setMessages([{
            id: Date.now(),
            text: welcomeMessage,
            sender: 'bot',
            timestamp: new Date(),
            type: 'info'
        }]);
    };

    const formatMessage = (text) => {
        if (!text || typeof text !== 'string') {
            return <div className="message-line">Message not available</div>;
        }

        try {
            return text.split('\n').map((line, i) => (
                <div key={i} className="message-line">
                    {line.split('**').map((part, j) => 
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                </div>
            ));
        } catch (error) {
            console.error('Error formatting message:', error);
            return <div className="message-line">{text}</div>;
        }
    };

    const getAuthStatus = () => {
        return isAuthenticated ? "✅ Logged In" : "🔓 Guest Mode";
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {/* Chatbot Toggle Button */}
            {!isOpen && (
                <button 
                    className="chatbot-toggle-btn customer-toggle"
                    onClick={() => setIsOpen(true)}
                    title="Food Assistant"
                >
                    <span className="chatbot-icon">🍕</span>
                    <span className="chatbot-label">Food Assistant</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={`chatbot-window customer-window ${isMinimized ? 'minimized' : ''}`}>
                    {/* Header */}
                    <div className="chatbot-header customer-header">
                        <div className="header-info">
                            <div className="customer-avatar">🍕</div>
                            <div>
                                <h6>Food Assistant</h6>
                                <span className="status">
                                    {getAuthStatus()}
                                    {isAuthenticated ? " | Ready to help!" : " | Limited features"}
                                </span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button 
                                className="header-btn"
                                onClick={clearChat}
                                title="Clear Chat"
                            >
                                🗑️
                            </button>
                            <button 
                                className="header-btn"
                                onClick={() => setIsMinimized(!isMinimized)}
                                title={isMinimized ? "Maximize" : "Minimize"}
                            >
                                {isMinimized ? "📁" : "—"}
                            </button>
                            <button 
                                className="header-btn close-btn"
                                onClick={() => setIsOpen(false)}
                                title="Close"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    {!isMinimized && (
                        <>
                            <div className="chatbot-messages">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.type || 'text'}`}
                                    >
                                        {message.sender === 'bot' && (
                                            <div className="bot-avatar customer-bot">🤖</div>
                                        )}
                                        <div className="message-content">
                                            <div className="message-text">
                                                {formatMessage(message.text)}
                                            </div>
                                            {message.intent && message.confidence > 0.7 && (
                                                <div className="message-meta">
                                                    🎯 {message.intent?.replace('customer_', '')} 
                                                    {` (${Math.round(message.confidence * 100)}%)`}
                                                </div>
                                            )}
                                            <div className="message-time">
                                                {message.timestamp?.toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="message bot-message">
                                        <div className="bot-avatar customer-bot">🤖</div>
                                        <div className="message-content">
                                            <div className="typing-indicator">
                                                <span>AI is thinking</span>
                                                <span className="typing-dots">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Actions */}
                            <div className="quick-actions">
                                <div className="quick-actions-header">
                                    <span>💡 Quick Actions</span>
                                    {!isAuthenticated && (
                                        <span className="auth-notice">🔒 Some features require login</span>
                                    )}
                                </div>
                                <div className="quick-actions-grid">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            className={`quick-action-btn customer-action ${
                                                action.requiresAuth && !isAuthenticated ? 'disabled-action' : ''
                                            }`}
                                            onClick={() => handleQuickAction(action)}
                                            disabled={isLoading || (action.requiresAuth && !isAuthenticated)}
                                            title={action.requiresAuth && !isAuthenticated ? "Login required" : action.message}
                                        >
                                            <span className="action-icon">{action.icon}</span>
                                            <span className="action-label">{action.label}</span>
                                            {action.requiresAuth && !isAuthenticated && (
                                                <span className="auth-lock">🔒</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="chatbot-input">
                                <div className="input-container">
                                    <textarea
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder={
                                            isAuthenticated 
                                                ? "Ask about food, cart, orders, or navigation..."
                                                : "Ask about food, restaurants, or pricing... (Login for full features)"
                                        }
                                        className="message-input customer-input"
                                        rows="1"
                                        disabled={isLoading}
                                    />
                                    <button 
                                        onClick={() => sendMessage()}
                                        className="send-btn customer-send"
                                        disabled={!inputMessage.trim() || isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="loading-spinner"></div>
                                        ) : (
                                            '🚀'
                                        )}
                                    </button>
                                </div>
                                <div className="input-hint">
                                    {isAuthenticated 
                                        ? "💡 Try: 'Find pizza', 'Show my cart', or 'Track my order'"
                                        : "💡 Try: 'Find pizza', 'Italian food', or 'Show restaurants'"
                                    }
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chatbot;