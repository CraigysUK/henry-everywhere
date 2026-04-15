'use client'

import { useState, useEffect } from 'react'
import { UserButton, useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'


type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const { openUserSettings } = useClerk()
  const router = useRouter()
  
  const [agentName, setAgentName] = useState('My Assistant')
  const [agentInstructions, setAgentInstructions] = useState('You are a helpful assistant.')
  const [apiKey, setApiKey] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load user settings on mount
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
    if (user) {
      loadSettings()
    }
  }, [isLoaded, user, router])

  const loadSettings = async () => {
    if (!user) return
    
    // Try to get settings from localStorage (for MVP)
    // In production, this would come from Supabase
    const savedName = localStorage.getItem('agent_name')
    const savedInstructions = localStorage.getItem('agent_instructions')
    const savedKey = localStorage.getItem('api_key')
    
    if (savedName) setAgentName(savedName)
    if (savedInstructions) setAgentInstructions(savedInstructions)
    if (savedKey) setApiKey(savedKey)
  }

  const saveSettings = () => {
    localStorage.setItem('agent_name', agentName)
    localStorage.setItem('agent_instructions', agentInstructions)
    localStorage.setItem('api_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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
          history: messages,
          apiKey
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

  if (!isLoaded || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Henry Everywhere 🦊</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="container mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">⚙️ Your Agent</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Dave's Helper"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                value={agentInstructions}
                onChange={(e) => setAgentInstructions(e.target.value)}
                placeholder="Tell your agent about yourself, how to help..."
                rows={4}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔑 OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get free key from platform.openai.com
              </p>
            </div>
            
            <button 
              onClick={saveSettings}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              {saved ? '✅ Saved!' : 'Save Settings'}
            </button>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm">
              💡 <strong>Tip:</strong> Tell your agent about your business, preferences, and how you like to communicate.
            </div>
          </div>

          {/* Chat Panel */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">💬 Chat with {agentName}</h2>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && (
                <p className="text-gray-400 text-center">
                  Start a conversation with {agentName}...
                </p>
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
              {isLoading && (
                <div className="bg-gray-100 p-4 rounded-lg mr-auto">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-4 border-t">
              {!apiKey && (
                <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
                  ⚠️ Please add your OpenAI API key in settings first
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border rounded-lg"
                  disabled={isLoading || !apiKey}
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !apiKey}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
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
