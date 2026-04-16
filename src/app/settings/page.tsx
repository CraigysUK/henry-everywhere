'use client'

import { useState, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserProfile = {
  name: string; business: string; goals: string; preferences: string; notes: string
}

export default function Settings() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  const [agentName, setAgentName] = useState('My Assistant')
  const [agentInstructions, setAgentInstructions] = useState('You are a helpful assistant.')
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '', business: '', goals: '', preferences: '', notes: ''
  })

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
    
    if (savedName) setAgentName(savedName)
    if (savedInstructions) setAgentInstructions(savedInstructions)
    if (savedKey) setApiKey(savedKey)
    if (savedProfile) setUserProfile(JSON.parse(savedProfile))
  }

  const saveSettings = () => {
    localStorage.setItem('agent_name', agentName)
    localStorage.setItem('agent_instructions', agentInstructions)
    localStorage.setItem('api_key', apiKey)
    localStorage.setItem('user_profile', JSON.stringify(userProfile))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!isLoaded || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-purple-700 hover:underline">← Back to Chat</Link>
          <h1 className="text-xl font-bold text-purple-700">⚙️ Settings</h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
          {/* Agent Settings */}
          <div>
            <h2 className="text-lg font-bold mb-4">🤖 Your AI Agent</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <textarea
                value={agentInstructions}
                onChange={(e) => setAgentInstructions(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="Tell your agent how to behave..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">🔑 OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... (leave empty to use shared key)"
                className="w-full p-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use the shared API key
              </p>
            </div>
          </div>

          {/* User Profile */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-bold mb-4">👤 About You (AI learns this)</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Your Business</label>
                <input
                  type="text"
                  value={userProfile.business}
                  onChange={(e) => setUserProfile({...userProfile, business: e.target.value})}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Your Goals</label>
                <textarea
                  value={userProfile.goals}
                  onChange={(e) => setUserProfile({...userProfile, goals: e.target.value})}
                  rows={2}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">How you like to communicate</label>
                <textarea
                  value={userProfile.preferences}
                  onChange={(e) => setUserProfile({...userProfile, preferences: e.target.value})}
                  rows={2}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={saveSettings}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
          >
            {saved ? '✅ Settings Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
