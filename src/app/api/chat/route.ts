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
    const { message, agentName, agentInstructions, history, apiKey, userProfile } = await request.json()
    
    const searchTriggers = [
    'rate',
    'exchange',
    'current',
    'price',
    'cost',
    'value',
    'today',
    'latest',
    'current','search', 'find', 'look up', 'what is', 'who is', 'when', 'where', 'current', 'latest', '2024', '2025', '2026', 'news', 'weather']
    const needsSearch = searchTriggers.some(t => message.toLowerCase().includes(t))
    
    let searchResults = ''
    if (needsSearch && process.env.BRAVE_SEARCH_API_KEY) {
      searchResults = await webSearch(message)
    }
    
    const userInfo = userProfile?.name ? `
USER INFO:
- Name: ${userProfile.name}
- Business: ${userProfile.business || 'Not specified'}
- Goals: ${userProfile.goals || 'Not specified'}
` : ''
    
    const formatInstructions = `
IMPORTANT - YOU HAVE WEB SEARCH CAPABILITY:
- You CAN search the web for current information, exchange rates, news, weather, facts
- When asked about current events, rates, or real-time data, you should search the web
- Use your search ability to provide accurate, up-to-date information

IMPORTANT FORMATTING RULES:
- Use paragraphs to separate different ideas (leave a blank line between paragraphs)
- Use bullet points (• or -) for lists
- Use numbered lists (1., 2., 3.) for sequential items
- Use **bold** for important terms
- Keep responses well-structured and easy to read
- Never write in one long paragraph - ALWAYS format nicely!
`
    
    const systemPrompt = agentName 
      ? `You are ${agentName}. ${agentInstructions} ${userInfo} ${formatInstructions}
${searchResults ? `SEARCH RESULTS:\n${searchResults}` : ''}`
      : `You are a helpful AI assistant. ${formatInstructions}
${searchResults ? `SEARCH RESULTS:\n${searchResults}` : ''}`
    
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
        max_tokens: 1000
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
