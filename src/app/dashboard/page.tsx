'use client'

import { useState, useEffect, use } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Message = { role: 'user' | 'assistant'; content: string }

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [agentName, setAgentName] = useState('My Assistant')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: '', business: '', goals: '', preferences: '', notes: ''
  })

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
      setIsSubscribed(true)
      localStorage.setItem('is_subscribed', 'true')
    }
  }, [searchParams])

  useEffect(() => {
    if (isLoaded && !user) router.push('/')
    if (user) loadSettings()
  }, [isLoaded, user, router])

  const loadSettings = () => {
    if (!user) return
    const savedName = localStorage.getItem('agent_name')
    const savedInstructions = localStorage.getItem('agent_instructions')
    const savedKey = localStorage.getItem('api_key')
    const savedProfile = localStorage.getItem('user_profile')
    const subscribed = localStorage.getItem('is_subscribed')
    
    if (savedName) setAgentName(savedName)
    if (savedProfile) setUserProfile(JSON.parse(savedProfile))
    if (subscribed === 'true') setIsSubscribed(true)
    
    const savedMessages = localStorage.getItem(`chat_history_${user.id}`)
    if (savedMessages) setMessages(JSON.parse(savedMessages))
  }

  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(messages))
    }
  }, [messages, user])

  const subscribe = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_1TMlqYBjgaFNhkg24u6z3tfg' })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (e) {
      alert('Error starting subscription')
    }
  }

  const clearChat = () => {
    if (user) localStorage.setItem(`chat_history_${user.id}`, JSON.stringify([]))
    setMessages([])
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const userInfo = `
USER DETAILS:
- Name: ${userProfile.name || 'Not set'}
- Business: ${userProfile.business || 'Not set'}
- Goals: ${userProfile.goals || 'Not set'}
- Preferences: ${userProfile.preferences || 'Not set'}
`
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, agentName,
          agentInstructions: 'You are a helpful AI assistant.',
          history: messages, userProfile
        })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    }
    setIsLoading(false)
  }

  if (!isLoaded || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-purple-700">🧠 {agentName}</h1>
          {isSubscribed && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">PRO</span>}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/settings" className="text-gray-600 hover:text-purple-700 text-sm">⚙️ Settings</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mx-4 mt-4 rounded">
          ✅ Subscription activated! Welcome to Pro!
        </div>
      )}

      {!isSubscribed && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 mx-4 mt-4 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold">Upgrade to Pro</span>
              <span className="ml-2">£24.95/month</span>
            </div>
            <button onClick={subscribe} className="bg-white text-purple-700 px-4 py-1 rounded font-bold text-sm">
              Subscribe
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 h-[calc(100vh-140px)]">
        {/* Chat Panel */}
        <div className="bg-white rounded-xl shadow-sm flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold">💬 Chat</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{messages.length} msgs</span>
              <button onClick={clearChat} className="text-xs text-gray-500 hover:text-red-500">Clear</button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10">
                <p className="text-lg mb-2">Start chatting with {agentName}!</p>
                <p className="text-sm">Go to Settings to configure your agent and profile.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`p-4 rounded-lg break-words ${msg.role === 'user' ? 'bg-blue-600 text-white ml-auto max-w-[80%]' : 'bg-gray-100 text-gray-800 mr-auto max-w-[80%]'}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 p-4 rounded-lg mr-auto">
                <span className="animate-pulse">Thinking...</span>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 p-3 border rounded-lg"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
