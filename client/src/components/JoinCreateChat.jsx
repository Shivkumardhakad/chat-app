import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import { useChatContext } from "../context/ChatContext";
import { useNavigate } from "react-router-dom";

const JoinCreateChat = () => {
    const [detail, setDetail] = useState({
        roomId: "",
        userName: "",
    });

    const { setRoomId, setCurrentUser, setConnected } = useChatContext();
    const navigate = useNavigate();

    function handleFormChange(event) {
        setDetail({
            ...detail,
            [event.target.name]: event.target.value,
        });
    }

    function validateForm() {
        if (detail.roomId.trim() === "" || detail.userName.trim() === "") {
            toast.error("Please fill in all fields");
            return false;
        }
        return true;
    }

    async function joinChat() {
        if (validateForm()) {
            try {
                const room = await joinChatApi(detail.roomId);
                toast.success(`Joined room: ${room.roomId}`);
                setCurrentUser(detail.userName);
                setRoomId(room.roomId);
                setConnected(true);
                navigate("/chat");
            } catch (error) {
                if (error.response?.status === 400) {
                    toast.error(error.response.data);
                } else {
                    toast.error("Room not found or error occurred");
                }
            }
        }
    }

    async function createRoom() {
        if (validateForm()) {
            try {
                const response = await createRoomApi(detail.roomId);
                toast.success("Room created successfully!");
                setCurrentUser(detail.userName);
                setRoomId(response.roomId);
                setConnected(true);
                navigate("/chat");
            } catch (error) {
                if (error.response?.status === 400) {
                    toast.error("Room already exists!");
                } else {
                    toast.error("Error creating room");
                }
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background blobs for premium feel */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="glass p-10 rounded-3xl w-full max-w-md shadow-glow flex flex-col gap-8 animate-fade-in z-10 border border-[var(--accents-2)]">
                <div className="text-center space-y-2">
                    <div className="inline-block p-3 rounded-2xl bg-[var(--accents-1)] mb-2 shadow-inner border border-[var(--accents-2)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--foreground)]">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-gradient">
                        ChatRoom
                    </h1>
                    <p className="text-[var(--accents-5)] text-sm font-medium">
                        Enter a room ID to create or join a conversation.
                    </p>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2 group">
                        <label htmlFor="userName" className="text-xs font-semibold text-[var(--accents-5)] uppercase tracking-wider group-focus-within:text-[var(--foreground)] transition-colors">
                            Your Name
                        </label>
                        <input
                            onChange={handleFormChange}
                            value={detail.userName}
                            type="text"
                            id="userName"
                            name="userName"
                            placeholder="e.g. Alice"
                            className="bg-[var(--accents-1)]/50 focus:bg-[var(--background)] transition-all"
                        />
                    </div>

                    <div className="space-y-2 group">
                        <label htmlFor="roomId" className="text-xs font-semibold text-[var(--accents-5)] uppercase tracking-wider group-focus-within:text-[var(--foreground)] transition-colors">
                            Room ID
                        </label>
                        <input
                            name="roomId"
                            onChange={handleFormChange}
                            value={detail.roomId}
                            type="text"
                            id="roomId"
                            placeholder="e.g. room-123"
                            className="bg-[var(--accents-1)]/50 focus:bg-[var(--background)] transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={joinChat}
                        className="flex-1 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accents-7)] font-bold py-3.5"
                    >
                        Join
                    </button>
                    <button
                        onClick={createRoom}
                        className="flex-1 secondary py-3.5"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinCreateChat;
