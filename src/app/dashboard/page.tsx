'use client'

import { useState, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [agentName, setAgentName] = useState('')
  const [agentInstructions, setAgentInstructions] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
  }, [isLoaded, user, router])

  if (!isLoaded || !user) return null

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          agentName,
          agentInstructions,
          history: messages 
        })
      })
      
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Henry Everywhere 🦊</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="container mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Your Agent</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Dave's Helper"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <textarea
                value={agentInstructions}
                onChange={(e) => setAgentInstructions(e.target.value)}
                placeholder="Tell your agent about yourself..."
                rows={4}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">Chat</h2>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && (
                <p className="text-gray-400 text-center">Start a conversation...</p>
              )}
              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={`p-4 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white ml-auto max-w-[80%]' 
                      : 'bg-gray-100 text-gray-800 mr-auto max-w-[80%]'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {isLoading && <div className="bg-gray-100 p-4 rounded-lg">Thinking...</div>}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border rounded-lg"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
