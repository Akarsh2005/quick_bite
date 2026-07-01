import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => {
        const existing = sessionStorage.getItem('admin_chatbot_session_id');
        if (existing) return existing;
        const newSessionId = `admin_session_${Date.now()}`;
        sessionStorage.setItem('admin_chatbot_session_id', newSessionId);
        return newSessionId;
    });
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initial welcome message
        setMessages([{
            id: 1,
            text: "👋 Hello! I'm your AI admin assistant. I can help you manage restaurants, food items, and orders.\n\nI can help you:\n\n🏪 **Restaurant Management**\n- Add/List restaurants\n- Update restaurant details\n- Delete restaurants\n\n🍕 **Food Management**\n- Add/List food items\n- Remove food items\n- Update menu\n\n📦 **Order Management**\n- View all orders\n- Update order status\n- Track order progress\n\n📊 **Statistics**\n- View dashboard stats\n- Revenue reports\n\nWhat would you like to do?",
            sender: 'bot',
            timestamp: new Date(),
            type: 'welcome'
        }]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${apiURL}/api/chatbot/admin/message`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    message: textToSend,
                    sessionId,
                    userId: user?._id || user?.id || 'admin_user'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    text: data.response,
                    sender: 'bot',
                    timestamp: new Date(),
                    intent: data.intent,
                    confidence: data.confidence,
                    modelUsed: data.modelUsed,
                    type: 'text'
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "❌ Sorry, I'm having trouble responding. Please try again.",
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
            label: "🏪 Add Restaurant", 
            message: "Add restaurant: Pizza Palace, 123 Main St, 555-0123",
            icon: "🏪"
        },
        { 
            label: "🍕 Add Food", 
            message: "Add food: Burger, Beef burger with cheese, 180, Fast Food, Pizza Palace",
            icon: "🍕"
        },
        { 
            label: "📦 List Orders", 
            message: "List all orders",
            icon: "📦"
        },
        { 
            label: "📊 View Stats", 
            message: "Show statistics",
            icon: "📊"
        },
        { 
            label: "🍽️ List Foods", 
            message: "List all food items",
            icon: "🍽️"
        },
        { 
            label: "🔄 Update Order", 
            message: "Update order status",
            icon: "🔄"
        },
        { 
            label: "🗑️ Delete Restaurant", 
            message: "Delete restaurant Pizza Palace",
            icon: "🗑️"
        },
        { 
            label: "❌ Delete Food", 
            message: "Delete food Burger",
            icon: "❌"
        }
    ];

    const handleQuickAction = (action) => {
        sendMessage(action.message);
    };

    const clearChat = () => {
        setMessages([{
            id: Date.now(),
            text: "💬 Chat cleared! How can I help you with restaurant management today?",
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

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {/* Chatbot Toggle Button */}
            {!isOpen && (
                <button 
                    className="chatbot-toggle-btn"
                    onClick={() => setIsOpen(true)}
                    title="AI Admin Assistant"
                >
                    <span className="chatbot-icon">🤖</span>
                    <span className="chatbot-label">AI Assistant</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="header-info">
                            <div className="admin-avatar">AI</div>
                            <div>
                                <h6>AI Admin Assistant</h6>
                                <span className="status">Ready to help</span>
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
                                            <div className="bot-avatar">AI</div>
                                        )}
                                        <div className="message-content">
                                            <div className="message-text">
                                                {formatMessage(message.text)}
                                            </div>
                                            {message.intent && message.confidence > 0.7 && (
                                                <div className="message-meta">
                                                    🎯 {message.intent?.replace('admin_', '')} 
                                                    {` (${Math.round(message.confidence * 100)}%)`}
                                                </div>
                                            )}
                                            <div className="message-time">
                                                {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {isLoading && (
                                    <div className="message bot-message">
                                        <div className="bot-avatar">AI</div>
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
                                </div>
                                <div className="quick-actions-grid">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            className="quick-action-btn"
                                            onClick={() => handleQuickAction(action)}
                                            disabled={isLoading}
                                            title={action.message}
                                        >
                                            <span className="action-icon">{action.icon}</span>
                                            <span className="action-label">{action.label}</span>
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
                                        placeholder="Ask about restaurants, foods, or orders... (e.g., 'Add restaurant: Pizza Palace, 123 Main St, 555-0123')"
                                        className="message-input"
                                        rows="1"
                                        disabled={isLoading}
                                    />
                                    <button 
                                        onClick={() => sendMessage()}
                                        className="send-btn"
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
                                    💡 Try: "Add restaurant: Name, Address, Phone" or "Update order abc123 to Delivered"
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