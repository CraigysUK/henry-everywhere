import { NextResponse } from 'next/server'

async function webSearch(query: string) {
  try {
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
      headers: { 'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY || '' }
    })
    const data = await res.json()
    const results = data.web?.results?.slice(0, 5) || []
    return results.map((r: any) => `${r.title}: ${r.url} - ${r.description}`).join('\n')
  } catch (e) { return 'Search failed' }
}

export async function POST(request: Request) {
  try {
    const { message, agentName, agentInstructions, history, apiKey, userProfile, documentText, agentType } = await request.json()
    
    const searchTriggers = ['rate', 'exchange', 'current', 'price', 'cost', 'value', 'today', 'latest', 'search', 'find', 'look up', 'what is', 'who is', 'when', 'where', 'news', 'weather']
    const needsSearch = searchTriggers.some(t => message.toLowerCase().includes(t))
    
    let searchResults = ''
    if (needsSearch && process.env.BRAVE_SEARCH_API_KEY) {
      searchResults = await webSearch(message)
    }

    let systemPrompt = ''
    
    if (agentType === 'contracts') {
      systemPrompt = `You are a construction and contract law expert AI assistant. You specialize in reviewing, analyzing, and answering questions about contracts, legal documents, and construction agreements.

When provided with a document:
- Analyze the document carefully
- Identify key terms, obligations, risks, and important clauses
- Answer specific questions about the document
- Highlight any concerns or areas of interest
- Use your expertise in construction and contract law to provide valuable insights

${documentText ? `DOCUMENT PROVIDED FOR REVIEW:\n${documentText}\n\n` : ''}`
    } else {
      systemPrompt = `You are a helpful AI assistant. ${agentInstructions || ''}

${documentText ? `DOCUMENT PROVIDED:\n${documentText}\n\n` : ''}`
    }
    
    if (searchResults) {
      systemPrompt += `\nSEARCH RESULTS:\n${searchResults}`
    }

    const userInfo = userProfile?.name ? `
USER CONTEXT:
- Name: ${userProfile.name}
- Business: ${userProfile.business || 'Not specified'}
- Goals: ${userProfile.goals || 'Not specified'}
` : ''
    
    systemPrompt += userInfo

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]
    
    const openaiKey = apiKey || process.env.OPENAI_API_KEY
    
    if (!openaiKey) {
      return NextResponse.json({ response: "Please add your OpenAI API key in settings to start chatting." })
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 1500
      })
    })
    
    const data = await response.json()
    
    if (data.error) {
      return NextResponse.json({ response: `Error: ${data.error.message}` })
    }
    
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not respond.'
    
    return NextResponse.json({ response: reply })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ response: 'Something went wrong.' }, { status: 500 })
  }
}
