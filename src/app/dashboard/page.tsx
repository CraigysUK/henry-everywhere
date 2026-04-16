'use client'

import { useState, useEffect, useState as useTransitionState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Message = { role: 'user' | 'assistant'; content: string }

function formatMessage(content: string) {
  return content
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState('chat')
  const [agentName, setAgentName] = useState('My Assistant')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Settings state
  const [userProfile, setUserProfile] = useState({
    name: '', business: '', goals: '', preferences: '', notes: ''
  })
  const [apiKey, setApiKey] = useState('')
  const [agentInstructions, setAgentInstructions] = useState('You are a helpful AI assistant.')
  const [saved, setSaved] = useState(false)

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

  const saveSettings = () => {
    localStorage.setItem('agent_name', agentName)
    localStorage.setItem('agent_instructions', agentInstructions)
    localStorage.setItem('api_key', apiKey)
    localStorage.setItem('user_profile', JSON.stringify(userProfile))
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
      const userInfo = `- Name: ${userProfile.name || 'Not set'}\n- Business: ${userProfile.business || 'Not set'}\n- Goals: ${userProfile.goals || 'Not set'}`
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, agentName,
          agentInstructions: agentInstructions + '\n\nUser context:\n' + userInfo,
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
    <div className="min-h-screen bg-[#313338] text-gray-100 flex">
      {/* Sidebar */}
      <div className="w-16 bg-[#1e1f22] flex flex-col items-center py-4 gap-2">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${activeTab === 'chat' ? 'bg-[#5865F2]' : 'bg-[#313338] hover:bg-[#3f4147]'}`}
        >
          💬
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${activeTab === 'settings' ? 'bg-[#5865F2]' : 'bg-[#313338] hover:bg-[#3f4147]'}`}
        >
          ⚙️
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${activeTab === 'profile' ? 'bg-[#5865F2]' : 'bg-[#313338] hover:bg-[#3f4147]'}`}
        >
          👤
        </button>
        <button 
          onClick={() => setActiveTab('subscription')}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${activeTab === 'subscription' ? 'bg-[#5865F2]' : 'bg-[#313338] hover:bg-[#3f4147]'}`}
        >
          💳
        </button>
        
        <div className="mt-auto">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 bg-[#2b2d31] flex items-center px-4 justify-between border-b border-[#1e1f22]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="font-semibold">{agentName}</span>
            {isSubscribed && <span className="text-xs bg-green-600 px-2 py-0.5 rounded text-white">PRO</span>}
          </div>
          <div className="text-sm text-gray-400">{userProfile.name || 'User'}</div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          
          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <>
              {showSuccess && (
                <div className="bg-green-600/20 border border-green-500 text-green-400 px-4 py-2 mx-4 mt-4 rounded">
                  ✅ Subscription activated! Welcome to Pro!
                </div>
              )}

              {!isSubscribed && (
                <div className="bg-gradient-to-r from-[#5865F2] to-[#7c3aed] p-4 mx-4 mt-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold">Upgrade to Pro</span>
                      <span className="ml-2 opacity-80">£24.95/month</span>
                    </div>
                    <button onClick={subscribe} className="bg-white text-[#5865F2] px-4 py-1.5 rounded font-bold text-sm hover:bg-gray-100">
                      Subscribe
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10">
                    <p className="text-lg mb-2">Start chatting with {agentName}!</p>
                    <p className="text-sm">Select ⚙️ to configure your settings.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-lg max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-[#5865F2] text-white ml-auto' 
                        : 'bg-[#2b2d31] text-gray-100 mr-auto'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-[#2b2d31] p-4 rounded-lg mr-auto">
                    <span className="animate-pulse text-gray-400">Thinking...</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#313338]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Message..."
                    className="flex-1 p-3 bg-[#383a40] border-none rounded-lg text-gray-100 placeholder-gray-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-[#5865F2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4752c4] disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">⚙️ Settings</h2>
              
              <div className="space-y-6">
                <div className="bg-[#2b2d31] p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">🤖 Agent Configuration</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Agent Name</label>
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="w-full p-2 bg-[#383a40] border-none rounded text-gray-100 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Instructions</label>
                      <textarea
                        value={agentInstructions}
                        onChange={(e) => setAgentInstructions(e.target.value)}
                        rows={3}
                        className="w-full p-2 bg-[#383a40] border-none rounded text-gray-100 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Custom API Key (optional)</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-... (leave empty for shared key)"
                        className="w-full p-2 bg-[#383a40] border-none rounded text-gray-100 mt-1"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={saveSettings}
                  className="w-full bg-[#5865F2] text-white py-2 rounded-lg font-medium hover:bg-[#4752c4]"
                >
                  {saved ? '✅ Saved!' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">👤 Your Profile</h2>
              
              <div className="bg-[#2b2d31] p-4 rounded-lg space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Your Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    className="w-full p-2 bg-[#383a40] border-none rounded text-gray-100 mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Your Business</label>
                  <input
                    type="text"
                    value={userProfile.business}
                    onChange={(e) => setUserProfile({...userProfile, business: e.target.value})}
                    className="w-full p-2 bg-[#383a40] border-none rounded text-gray-100 mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Your Goals</label>
                  <textarea
                    value={userProfile.goals}
                    onChange={(e) => setUserProfile({...userProfile, goals: e.target.value})}
                    rows={3}
                    className="w-full p-2 bg-[#383a40] border-none rounded text-gray-100 mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Communication Preferences</label>
                  <textarea
                    value={userProfile.preferences}
                    onChange={(e) => setUserProfile({...userProfile, preferences: e.target.value})}
                    rows={2}
                    className="w-full p-2 bg-[#383a40] border-none rounded text-gray-100 mt-1"
                  />
                </div>
                <button 
                  onClick={saveSettings}
                  className="w-full bg-[#5865F2] text-white py-2 rounded-lg font-medium hover:bg-[#4752c4]"
                >
                  {saved ? '✅ Saved!' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">💳 Subscription</h2>
              
              {isSubscribed ? (
                <div className="bg-green-600/20 border border-green-500 p-4 rounded-lg">
                  <p className="text-green-400 font-bold">✅ You're a PRO member!</p>
                  <p className="text-gray-400 text-sm mt-1">Your subscription is active. Thank you for supporting Henry Everywhere!</p>
                </div>
              ) : (
                <div className="bg-[#2b2d31] p-6 rounded-lg text-center">
                  <h3 className="text-lg font-bold mb-2">Upgrade to PRO</h3>
                  <p className="text-gray-400 mb-4">Get unlimited access to all features</p>
                  <p className="text-3xl font-bold text-[#5865F2] mb-4">£24.95<span className="text-sm font-normal text-gray-400">/month</span></p>
                  <ul className="text-left text-gray-400 mb-6 space-y-2">
                    <li>✅ Unlimited AI conversations</li>
                    <li>✅ Web search capabilities</li>
                    <li>✅ Priority support</li>
                    <li>✅ New features first</li>
                  </ul>
                  <button 
                    onClick={subscribe}
                    className="w-full bg-[#5865F2] text-white py-3 rounded-lg font-bold hover:bg-[#4752c4]"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
