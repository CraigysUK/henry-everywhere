'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

type Message = { role: 'user' | 'assistant'; content: string }

const FREE_MESSAGE_LIMIT = 20

function formatMessage(content: string) {
  return content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')
}

export default function ContractsDashboard() {
  const [activeTab, setActiveTab] = useState('chat')
  const [agentName] = useState('ContractPRO')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messagesUsedToday, setMessagesUsedToday] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [documentText, setDocumentText] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [isProcessingDoc, setIsProcessingDoc] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsProcessingDoc(true)
    setDocumentName(file.name)
    
    try {
      const text = await file.text()
      setDocumentText(text)
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: `📄 Uploaded document: ${file.name}\n\nDocument loaded and ready for review. Ask me anything about it!` 
      }])
    } catch (err) {
      alert('Failed to read document. Please try a text file.')
    }
    setIsProcessingDoc(false)
  }

  const clearDocument = () => {
    setDocumentText('')
    setDocumentName('')
  }

  const handleSend = async () => {
    if (!input.trim()) return
    if (messagesUsedToday >= FREE_MESSAGE_LIMIT) {
      setShowLimitModal(true)
      return
    }
    
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    const newCount = messagesUsedToday + 1
    setMessagesUsedToday(newCount)

    try {
      const response = await fetch('/api/chat-with-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          agentName,
          agentInstructions: 'You are a construction contract expert.',
          history: messages, 
          userProfile: {},
          documentText,
          agentType: 'contracts'
        })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#313338] text-gray-100 flex">
      {/* Sidebar */}
      <div className="w-16 bg-[#1e1f22] flex flex-col items-center py-4 gap-2">
        <button onClick={() => setActiveTab('chat')} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${activeTab === 'chat' ? 'bg-[#5865F2]' : 'bg-[#313338] hover:bg-[#3f4147]'}`}>💬</button>
        <button onClick={() => setActiveTab('docs')} className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${activeTab === 'docs' ? 'bg-[#5865F2]' : 'bg-[#313338] hover:bg-[#3f4147]'}`}>📄</button>
        <div className="mt-auto">
          <Link href="/" className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-[#313338] hover:bg-[#3f4147]" title="Henry Everywhere">🦊</Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-[#2b2d31] flex items-center px-4 justify-between border-b border-[#1e1f22]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏗️</span>
            <span className="font-semibold">{agentName}</span>
            <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded">Contract Expert</span>
          </div>
          <span className="text-xs text-gray-400">{messagesUsedToday}/{FREE_MESSAGE_LIMIT} msgs</span>
        </div>

        <div className="flex-1 flex flex-col">
          {activeTab === 'chat' && (
            <>
              {documentName && (
                <div className="bg-amber-500/20 border border-amber-500 px-4 py-2 mx-4 mt-4 rounded-lg flex justify-between items-center">
                  <span className="text-amber-400">📄 {documentName}</span>
                  <button onClick={clearDocument} className="text-amber-400 hover:text-amber-300 text-sm">Remove</button>
                </div>
              )}

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-10">
                    <p className="text-lg mb-2">🏗️ ContractPRO - Contract Review Expert</p>
                    <p className="text-sm">Upload a contract in 📄 tab, then ask questions.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`p-4 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-[#5865F2] text-white ml-auto' : 'bg-[#2b2d31] text-gray-100 mr-auto'}`}>
                    {msg.role === 'user' ? msg.content : <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-[#2b2d31] p-4 rounded-lg mr-auto">
                    <span className="animate-pulse text-gray-400">Analyzing...</span>
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
                    placeholder="Ask about your contract..."
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

          {activeTab === 'docs' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">📄 Upload Contract</h2>
              <div className="bg-[#2b2d31] p-6 rounded-lg mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/10 transition"
                >
                  {isProcessingDoc ? (
                    <span className="animate-pulse text-gray-400">Processing...</span>
                  ) : documentName ? (
                    <div>
                      <p className="text-amber-400 text-lg mb-2">✅ {documentName}</p>
                      <p className="text-gray-400 text-sm">Go to chat to ask questions.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl mb-2">📁</p>
                      <p className="text-gray-300 mb-1">Click to upload contract</p>
                      <p className="text-gray-500 text-sm">TXT, PDF, DOC, DOCX</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2b2d31] p-6 rounded-lg max-w-sm text-center">
            <h3 className="text-xl font-bold mb-2">Daily Limit Reached</h3>
            <p className="text-gray-400 mb-4">Free: {FREE_MESSAGE_LIMIT} msgs/day</p>
            <button onClick={() => setShowLimitModal(false)} className="w-full mt-2 text-gray-400 text-sm">OK</button>
          </div>
        </div>
      )}
    </div>
  )
}
