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
      setMessages(prev => [...prev, { role: 'user', content: `📄 Uploaded: ${file.name}\n\nReady for review. Ask me anything!` }])
    } catch (err) {
      alert('Failed to read document.')
    }
    setIsProcessingDoc(false)
  }

  const clearDocument = () => { setDocumentText(''); setDocumentName('') }

  const handleSend = async () => {
    if (!input.trim()) return
    if (messagesUsedToday >= FREE_MESSAGE_LIMIT) { setShowLimitModal(true); return }
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setMessagesUsedToday(prev => prev + 1)
    try {
      const response = await fetch('/api/chat-with-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, agentName: 'ContractPRO', agentInstructions: 'You are a construction contract expert.', history: messages, documentText, agentType: 'contracts' })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error. Please try again.' }])
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏗️</span>
            <span className="text-xl font-bold text-amber-500">ContractPRO</span>
            <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded ml-2">AI Contract Expert</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-amber-500 hover:text-amber-400 text-sm">← Henry Everywhere</Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('chat')} className={`px-6 py-2 rounded-lg font-medium ${activeTab === 'chat' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-gray-300'}`}>💬 Chat</button>
          <button onClick={() => setActiveTab('docs')} className={`px-6 py-2 rounded-lg font-medium ${activeTab === 'docs' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-gray-300'}`}>📄 Upload Contract</button>
        </div>

        {activeTab === 'chat' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-xl overflow-hidden">
                {documentName && (
                  <div className="bg-amber-500/20 border-b border-amber-500 px-4 py-2 flex justify-between items-center">
                    <span className="text-amber-400">📄 {documentName}</span>
                    <button onClick={clearDocument} className="text-amber-400 text-sm hover:text-amber-300">Remove</button>
                  </div>
                )}
                
                <div className="h-96 p-4 overflow-y-auto space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 py-10">
                      <p className="text-xl mb-2">🏗️ ContractPRO</p>
                      <p className="text-gray-500">Upload a contract, then ask questions about it.</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`p-4 rounded-lg max-w-[90%] ${msg.role === 'user' ? 'bg-amber-500 text-black ml-auto' : 'bg-slate-700 text-gray-100 mr-auto'}`}>
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    </div>
                  ))}
                  {isLoading && <div className="bg-slate-700 p-4 rounded-lg mr-auto"><span className="animate-pulse text-gray-400">Analyzing contract...</span></div>}
                </div>

                <div className="p-4 bg-slate-700">
                  <div className="flex gap-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask about your contract..." className="flex-1 p-3 bg-slate-600 border-none rounded-lg text-white placeholder-gray-400" disabled={isLoading} />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-amber-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-amber-400 disabled:opacity-50">Send</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="font-bold text-amber-500 mb-4">How It Works</h3>
                <div className="space-y-4 text-gray-300">
                  <div className="flex gap-3">
                    <span className="text-amber-500">1.</span>
                    <div><p className="font-medium">Upload Contract</p><p className="text-sm text-gray-500">PDF, DOC, or TXT files</p></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-amber-500">2.</span>
                    <div><p className="font-medium">Ask Questions</p><p className="text-sm text-gray-500">Get expert analysis instantly</p></div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-amber-500">3.</span>
                    <div><p className="font-medium">Review & Save</p><p className="text-sm text-gray-500">Export insights for your records</p></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl">
                <h3 className="font-bold text-amber-500 mb-4">Expertise</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>✅ Contract Review</li>
                  <li>✅ Risk Analysis</li>
                  <li>✅ Obligation Checks</li>
                  <li>✅ Clause Extraction</li>
                  <li>✅ Construction Law</li>
                  <li>✅ FM Agreements</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800 p-8 rounded-xl text-center">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.pdf,.doc,.docx" className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-600 rounded-xl p-12 cursor-pointer hover:border-amber-500 hover:bg-slate-700/50 transition">
                {isProcessingDoc ? <p className="animate-pulse text-gray-400">Processing...</p> : documentName ? (
                  <div><p className="text-4xl mb-4">✅</p><p className="text-xl text-amber-500 font-bold">{documentName}</p><p className="text-gray-400 mt-2">Go to Chat tab to ask questions</p></div>
                ) : (
                  <div><p className="text-5xl mb-4">📄</p><p className="text-xl font-bold mb-2">Drop your contract here</p><p className="text-gray-400">PDF, DOC, DOCX, or TXT</p></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg max-w-sm text-center">
            <h3 className="text-xl font-bold mb-2">Daily Limit Reached</h3>
            <p className="text-gray-400 mb-4">Free: {FREE_MESSAGE_LIMIT} messages/day</p>
            <button onClick={() => setShowLimitModal(false)} className="w-full bg-amber-500 text-black py-2 rounded font-bold">OK</button>
          </div>
        </div>
      )}
    </div>
  )
}
