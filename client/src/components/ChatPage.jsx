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
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="flex-shrink-0 h-16 border-b border-[var(--accents-3)] flex items-center justify-between px-6 bg-white z-20">
                <div className="flex items-center gap-3">
                    {/* Google Chat-like Icon or Avatar for Room */}
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium text-lg">
                        {roomId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-lg font-medium text-[var(--foreground)] leading-snug">{roomId}</h1>
                        <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                            <span className="text-[var(--accents-7)]">Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-[var(--accents-7)] hidden sm:block">
                        Signed in as <span className="font-medium text-[var(--foreground)]">{currentUser}</span>
                    </div>
                    <button
                        onClick={handleLeave}
                        className="text-sm font-medium text-[var(--accents-7)] hover:bg-[var(--accents-1)] hover:text-[var(--foreground)] bg-transparent border border-[var(--accents-3)] px-4 py-2 rounded"
                    >
                        Exit
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 scroll-smooth">
                {messages.map((msg, index) => {
                    const isOwn = msg.sender === currentUser;
                    return (
                        <div
                            key={index}
                            className={`flex w-full ${isOwn ? "justify-end" : "justify-start"} animate-fade-in group mb-2`}
                        >
                            <div className={`flex max-w-[80%] sm:max-w-[60%] gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                                    ${isOwn
                                        ? "bg-[var(--primary)] text-white"
                                        : "bg-[var(--accents-5)] text-white"
                                    }`}
                                >
                                    {getInitials(msg.sender)}
                                </div>

                                <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-sm font-medium text-[var(--foreground)]">
                                            {isOwn ? "You" : msg.sender}
                                        </span>
                                        <span className="text-xs text-[var(--accents-6)]">
                                            {formatTime(msg.timeStamp || msg.messageTime)}
                                        </span>
                                    </div>

                                    <div className={`px-4 py-2 text-[0.9375rem] shadow-sm message-bubble ${isOwn ? 'own' : 'other'}`}>
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={chatBoxRef} />
            </main>

            {/* Input Area */}
            <footer className="flex-shrink-0 p-4 bg-white z-20">
                <div className="max-w-4xl mx-auto flex items-center gap-2 bg-[var(--surface)] border border-[var(--accents-3)] px-2 py-2 rounded-[24px] focus-within:shadow-md transition-shadow">

                    {/* Plus Icon (Mock for attachments) */}
                    <button className="p-2 rounded-full text-[var(--accents-6)] hover:bg-[var(--accents-2)] bg-transparent w-auto h-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") sendMessage();
                        }}
                        placeholder="History is on"
                        className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)] placeholder-[var(--accents-6)] px-2 focus:box-shadow-none"
                    />

                    {/* Send Button */}
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className={`p-2 rounded-full transition-colors w-auto h-auto flex items-center justify-center
                            ${input.trim() ? "text-[var(--primary)] hover:bg-[var(--primary)]/10 bg-transparent" : "text-[var(--accents-4)] bg-transparent cursor-default"}`}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-xs text-[var(--accents-5)]">Press Enter to send</p>
                </div>
            </footer>
        </div>
    );
};

export default ChatPage;
