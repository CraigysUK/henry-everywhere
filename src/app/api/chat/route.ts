import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message, agentName, agentInstructions, history, apiKey } = await request.json()
    
    // Build system prompt with user's customizations
    const systemPrompt = agentName 
      ? `You are ${agentName}, a helpful AI assistant. ${agentInstructions}`
      : 'You are a helpful AI assistant.'
    
    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]
    
    // Use user's API key from settings
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
        max_tokens: 500
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
