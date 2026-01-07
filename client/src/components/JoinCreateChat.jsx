import React, { useState } from "react";
import chatIcon from "../assets/speech-bubble.png"; // Placeholder
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
        if (detail.roomId === "" || detail.userName === "") {
            toast.error("Invalid Input");
            return false;
        }
        return true;
    }

    async function joinChat() {
        if (validateForm()) {
            try {
                const room = await joinChatApi(detail.roomId);
                toast.success("Joined..");
                setCurrentUser(detail.userName);
                setRoomId(room.roomId);
                setConnected(true);
                navigate("/chat");
            } catch (error) {
                if (error.response?.status === 400) {
                    toast.error(error.response.data);
                } else {
                    toast.error("Error in joining room");
                }
                console.log(error);
            }
        }
    }

    async function createRoom() {
        if (validateForm()) {
            try {
                const response = await createRoomApi(detail.roomId);
                console.log(response);
                toast.success("Room Created Successfully !!");
                setCurrentUser(detail.userName);
                setRoomId(response.roomId);
                setConnected(true);
                navigate("/chat");
            } catch (error) {
                if (error.response?.status === 400) {
                    toast.error("Room already exists!");
                } else {
                    toast.error("Error in creating room");
                }
                console.log(error);
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center animate-fade-in">
            <div className="p-10 border border-[var(--accents-2)] rounded-2xl w-full max-w-md bg-[var(--accents-1)] shadow-2xl flex flex-col gap-6">
                <div className="text-center">
                    {/* Adding a sleek header instead of image */}
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-[var(--foreground)] to-[var(--accents-5)] bg-clip-text text-transparent">
                        ChatRoom
                    </h1>
                    <p className="text-[var(--accents-5)]">
                        Connect securely with your friends in real-time.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="userName" className="text-sm font-medium text-[var(--accents-4)]">
                            Your Name
                        </label>
                        <input
                            onChange={handleFormChange}
                            value={detail.userName}
                            type="text"
                            id="userName"
                            name="userName"
                            placeholder="Enter your name"
                            className="w-full transition-all focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="roomId" className="text-sm font-medium text-[var(--accents-4)]">
                            Room ID
                        </label>
                        <input
                            name="roomId"
                            onChange={handleFormChange}
                            value={detail.roomId}
                            type="text"
                            id="roomId"
                            placeholder="Enter room ID"
                            className="w-full transition-all focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex gap-3 justify-center mt-4">
                    <button
                        onClick={joinChat}
                        className="flex-1 bg-[var(--success)] hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02]"
                    >
                        Join Room
                    </button>
                    <button
                        onClick={createRoom}
                        className="flex-1 secondary font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02]"
                    >
                        Create Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinCreateChat;
