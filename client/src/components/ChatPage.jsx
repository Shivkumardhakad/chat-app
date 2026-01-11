import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessagesApi } from "../services/RoomService";
import { useChatContext } from "../context/ChatContext";

const ChatPage = () => {
    const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();

    const navigate = useNavigate();
    useEffect(() => {
        if (!connected) {
            navigate("/");
        }
    }, [connected, navigate]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);

    // Load initial messages
    useEffect(() => {
        async function loadMessages() {
            try {
                const msgs = await getMessagesApi(roomId);
                setMessages(msgs);
            } catch (error) {
                console.error(error);
            }
        }
        if (connected) {
            loadMessages();
        }
    }, [connected, roomId]);

    // Scroll to bottom
    useEffect(() => {
        if (chatBoxRef.current) {
            // Use timeout to ensure DOM updates first
            setTimeout(() => {
                chatBoxRef.current.scrollIntoView({ behavior: "smooth" });
            }, 50);
        }
    }, [messages]);

    // WebSocket Connection
    useEffect(() => {
        let client = null;

        const connectWebSocket = () => {
            const sock = new SockJS("/chat");
            client = Stomp.over(sock);

            client.connect({}, () => {
                setStompClient(client);
                toast.success("Connected");

                client.subscribe(`/topic/room/${roomId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, newMessage]);
                });
            }, (error) => {
                console.error("Connection error: ", error);
                toast.error("Connection failed");
            });
        };

        if (connected) {
            connectWebSocket();
        }

        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, [roomId, connected]);

    const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
            const message = {
                sender: currentUser,
                content: input,
                roomId: roomId,
                messageTime: new Date().toISOString()
            };

            stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
            setInput("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleLeave = () => {
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        navigate("/");
    };

    const formatTime = (isoString) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return "";
        }
    };

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "?";
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
            {/* Header */}
            <header className="flex-shrink-0 h-16 border-b border-[var(--accents-2)] flex items-center justify-between px-6 bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                        #
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Room: <span className="font-mono text-[var(--accents-6)]">{roomId}</span></h1>
                        <div className="flex items-center gap-2 text-xs text-[var(--accents-5)] font-medium">
                            <span className="w-2 h-2 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)]"></span>
                            Online as {currentUser}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLeave}
                    className="text-xs font-semibold bg-[var(--accents-1)] hover:bg-[var(--error)] hover:text-white hover:border-[var(--error)] text-[var(--accents-5)] border border-[var(--accents-2)] py-2 px-4 rounded-full transition-all duration-300"
                >
                    Leave Room
                </button>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth custom-scrollbar">
                {messages.map((msg, index) => {
                    const isOwn = msg.sender === currentUser;
                    return (
                        <div
                            key={index}
                            className={`flex items-end gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"} animate-fade-in group`}
                        >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-md
                        ${isOwn
                                    ? "bg-[var(--foreground)] text-[var(--background)]"
                                    : "bg-gradient-to-tr from-blue-500 to-purple-600 text-white"
                                }`}
                            >
                                {getInitials(msg.sender)}
                            </div>

                            <div
                                className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                            >
                                <span className="text-xs text-[var(--accents-5)] mb-1 ml-1 font-semibold">
                                    {isOwn ? "You" : msg.sender}
                                </span>

                                <div className={`px-5 py-3 text-sm shadow-sm relative message-bubble ${isOwn ? 'own' : 'other'}`}>
                                    <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                </div>

                                <span className="text-[10px] text-[var(--accents-4)] mt-1 mx-1 font-mono opacity-60">
                                    {formatTime(msg.timeStamp || msg.messageTime)}
                                </span>
                            </div>
                        </div>
                    )
                })}
                <div ref={chatBoxRef} />
            </main>

            {/* Input Area */}
            <footer className="flex-shrink-0 p-4 sm:p-6 border-t border-[var(--accents-2)] bg-[var(--background)]/80 backdrop-blur-md z-20">
                <div className="max-w-4xl mx-auto flex gap-3 relative items-center">
                    {/* Input Wrapper for better visuals */}
                    <div className="flex-1 relative group">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                            placeholder="Type a message..."
                            className="w-full bg-[var(--accents-1)] text-[var(--foreground)] border border-[var(--accents-2)] rounded-full pl-6 pr-12 py-3.5 focus:ring-2 focus:ring-[var(--accents-3)] focus:border-transparent outline-none transition-all placeholder:text-[var(--accents-4)] shadow-inner"
                        />
                        {/* Decorative icon inside input */}
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--accents-4)] group-focus-within:text-[var(--foreground)] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </div>
                    </div>

                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accents-7)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5 ml-0.5"
                        >
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ChatPage;
