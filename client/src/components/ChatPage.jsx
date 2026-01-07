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
            chatBoxRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // WebSocket Connection
    useEffect(() => {
        const connectWebSocket = () => {
            const sock = new SockJS("http://localhost:8080/chat");
            const client = Stomp.over(sock);

            client.connect({}, () => {
                setStompClient(client);
                toast.success("Connected to chat");

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
            if (stompClient) {
                stompClient.disconnect();
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

    return (
        <div className="flex flex-col h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
            <header className="flex-shrink-0 h-16 border-b border-[var(--accents-2)] flex items-center justify-between px-6 bg-[var(--accents-1)]/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Room: <span className="text-[var(--accents-5)]">{roomId}</span></h1>
                    <p className="text-xs text-[var(--accents-5)] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
                        {currentUser}
                    </p>
                </div>
                <button
                    onClick={handleLeave}
                    className="bg-[var(--accents-1)] text-[var(--error)] border border-[var(--accents-2)] text-sm hover:bg-[var(--accents-2)] hover:border-[var(--accents-3)] py-2 px-4 ml-4 font-semibold"
                >
                    Leave Room
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((msg, index) => {
                    const isOwn = msg.sender === currentUser;
                    return (
                        <div
                            key={index}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fade-in`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-sm
                        ${isOwn
                                        ? "bg-[var(--foreground)] text-[var(--background)] rounded-br-sm"
                                        : "bg-[var(--accents-2)] text-[var(--foreground)] rounded-bl-sm"
                                    }`}
                            >
                                {!isOwn && <p className="text-[11px] font-bold opacity-50 mb-1 block text-blue-400 uppercase tracking-wider">{msg.sender}</p>}
                                <p className="leading-relaxed font-medium">{msg.content}</p>
                                <div className={`text-[10px] mt-1 text-right opacity-60 font-mono ${isOwn ? "opacity-40" : ""}`}>
                                    {formatTime(msg.timeStamp || msg.messageTime)}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={chatBoxRef} />
            </main>

            <footer className="flex-shrink-0 p-4 border-t border-[var(--accents-2)] bg-[var(--background)] z-20">
                <div className="max-w-4xl mx-auto flex gap-3 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") sendMessage();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-[var(--accents-1)] text-[var(--foreground)] border border-[var(--accents-2)] rounded-lg px-6 h-12 focus:ring-1 focus:ring-[var(--foreground)] focus:border-[var(--foreground)] outline-none transition-all placeholder:text-[var(--accents-4)]"
                    />
                    <button
                        onClick={sendMessage}
                        className="rounded-lg w-12 h-12 flex items-center justify-center p-0 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accents-7)] transition-all"
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
