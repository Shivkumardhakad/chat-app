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
                } else if (error.response?.status === 500) {
                    toast.error("Server Error: Is MongoDB running?");
                } else {
                    toast.error("Error creating room");
                }
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
            <div className="bg-white p-10 rounded-lg w-full max-w-[450px] shadow-md flex flex-col gap-8 animate-fade-in border border-[var(--accents-2)]">
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary)] text-white mb-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-normal text-[var(--foreground)]">
                        Google Chat Clone
                    </h1>
                    <p className="text-[var(--accents-7)] text-base">
                        Sign in to start chatting
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1">
                        <label htmlFor="userName" className="text-sm font-medium text-[var(--accents-8)]">
                            Your Name
                        </label>
                        <input
                            onChange={handleFormChange}
                            value={detail.userName}
                            type="text"
                            id="userName"
                            name="userName"
                            placeholder="Enter your name"
                            className="bg-white focus:bg-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="roomId" className="text-sm font-medium text-[var(--accents-8)]">
                            Room ID
                        </label>
                        <input
                            name="roomId"
                            onChange={handleFormChange}
                            value={detail.roomId}
                            type="text"
                            id="roomId"
                            placeholder="Enter room ID"
                            className="bg-white focus:bg-white"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={createRoom}
                        className="secondary"
                    >
                        Create Room
                    </button>
                    <button
                        onClick={joinChat}
                        className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                    >
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinCreateChat;
