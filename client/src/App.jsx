import { useState } from 'react'
import './App.css'
import JoinCreateChat from './components/JoinCreateChat'
import ChatPage from './components/ChatPage'
import { Routes, Route } from 'react-router-dom'
import { ChatProvider } from './context/ChatContext'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <ChatProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<JoinCreateChat />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </ChatProvider>
  )
}

export default App
