import { NextResponse } from 'next/server'

// Search function using Brave Search API
async function webSearch(query: string) {
  try {
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY || ''
      }
    })
    const data = await res.json()
    const results = data.web?.results?.slice(0, 5) || []
    return results.map((r: any) => `${r.title}: ${r.url} - ${r.description}`).join('\n')
  } catch (e) {
    return 'Search failed'
  }
}

export async function POST(request: Request) {
  try {
    const { message, agentName, agentInstructions, history, apiKey } = await request.json()
    
    // Check if we need to search the web
    const searchTriggers = ['search', 'find', 'look up', 'what is', 'who is', 'when', 'where', 'current', 'latest', '2024', '2025', '2026', 'news']
    const needsSearch = searchTriggers.some(t => message.toLowerCase().includes(t))
    
    let searchResults = ''
    if (needsSearch && process.env.BRAVE_SEARCH_API_KEY) {
      searchResults = await webSearch(message)
    }
    
    // Build system prompt
    const systemPrompt = agentName 
      ? `You are ${agentName}, a helpful AI assistant. ${agentInstructions}
      
IMPORTANT: You can search the web for current information. When someone asks about recent events, news, or information that might have changed, use your knowledge or explain you can search the web. You have full browsing capabilities - you can search for information, find current data, and browse websites to get up-to-date information.

${searchResults ? `Here are some search results that may help:\n${searchResults}` : ''}`
      : `You are a helpful AI assistant. You have full browsing capabilities - you can search for information, find current data, and browse websites.
${searchResults ? `Here are some search results that may help:\n${searchResults}` : ''}`
    
    // Build messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]
    
    const openaiKey = apiKey || process.env.OPENAI_API_KEY
    
    if (!openaiKey) {
      return NextResponse.json({ 
        response: "Please add your OpenAI API key in settings to start chatting." 
      })
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
        max_tokens: 1000
      })
    })
    
    const data = await response.json()
    
    if (data.error) {
      return NextResponse.json({ 
        response: `Error: ${data.error.message}` 
      })
    }
    
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not respond.'
    
    return NextResponse.json({ response: reply })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ response: 'Something went wrong. Please check your API key.' }, { status: 500 })
  }
}
