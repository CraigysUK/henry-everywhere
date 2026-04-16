'use client'

import { useState, useEffect, use } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

type Message = { role: 'user' | 'assistant'; content: string }

type UserProfile = {
  name: string; business: string; goals: string; preferences: string; notes: string
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [agentName, setAgentName] = useState('My Assistant')
  const [agentInstructions, setAgentInstructions] = useState('You are a helpful assistant.')
  const [apiKey, setApiKey] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
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
    if (savedInstructions) setAgentInstructions(savedInstructions)
    if (savedKey) setApiKey(savedKey)
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

  useEffect(() => {
    if (user) localStorage.setItem('user_profile', JSON.stringify(userProfile))
  }, [userProfile, user])

  const saveSettings = () => {
    localStorage.setItem('agent_name', agentName)
    localStorage.setItem('agent_instructions', agentInstructions)
    localStorage.setItem('api_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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
          agentInstructions: agentInstructions + userInfo,
          history: messages, apiKey, userProfile
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
        <h1 className="text-xl font-bold text-purple-700">Henry Everywhere 🦊</h1>
        {isSubscribed && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">PRO</span>}
        <UserButton afterSignOutUrl="/" />
      </header>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mx-4 mt-4 rounded">
          ✅ Subscription activated! Welcome to Pro!
        </div>
      )}

      <div className="container mx-auto p-6">
        {!isSubscribed && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl mb-6">
            <h2 className="text-2xl font-bold mb-2">🚀 Upgrade to Pro</h2>
            <p className="mb-4">Get unlimited access for £24.95/month</p>
            <button onClick={subscribe} className="bg-white text-purple-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-100">
              Subscribe Now
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold mb-4">⚙️ Your Agent</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                <textarea value={agentInstructions} onChange={(e) => setAgentInstructions(e.target.value)} rows={3} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">🔑 OpenAI API Key</label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className="w-full p-2 border rounded-lg" />
              </div>
              <button onClick={saveSettings} className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700">
                {saved ? '✅ Saved!' : 'Save Settings'}
              </button>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-bold mb-4">👤 About You</h2>
              <div className="space-y-3">
                <div><label className="block text-xs text-gray-600 mb-1">Your Name</label>
                  <input type="text" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs text-gray-600 mb-1">Your Business</label>
                  <input type="text" value={userProfile.business} onChange={(e) => setUserProfile({...userProfile, business: e.target.value})} className="w-full p-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs text-gray-600 mb-1">Your Goals</label>
                  <textarea value={userProfile.goals} onChange={(e) => setUserProfile({...userProfile, goals: e.target.value})} rows={2} className="w-full p-2 border rounded-lg text-sm" /></div>
              </div>
            </div>

            <button onClick={clearChat} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300">
              🗑️ Clear Chat
            </button>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">💬 {agentName}</h2>
              <span className="text-xs text-gray-500">{messages.length} msgs</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && <p className="text-gray-400 text-center">Chat with {agentName}...</p>}
              {messages.map((msg, i) => (
                <div key={i} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white ml-auto max-w-[80%]' : 'bg-gray-100 text-gray-800 mr-auto max-w-[80%]'}`}>
                  {msg.content}
                </div>
              ))}
              {isLoading && <div className="bg-gray-100 p-4 rounded-lg mr-auto"><span className="animate-pulse">Thinking...</span></div>}
            </div>
            <div className="p-4 border-t">
              {!apiKey && <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">⚠️ Add OpenAI API key first</div>}
              <div className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type..." className="flex-1 p-3 border rounded-lg" disabled={isLoading || !apiKey} />
                <button onClick={handleSend} disabled={isLoading || !apiKey} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
