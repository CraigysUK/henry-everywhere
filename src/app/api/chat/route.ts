import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message, agentName, agentInstructions, history } = await request.json()
    
    // Build system prompt
    const systemPrompt = agentName 
      ? `You are ${agentName}, a helpful AI assistant. ${agentInstructions}`
      : 'You are a helpful AI assistant.'
    
    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]
    
    // Call OpenAI (user provides their own API key via UI, or use env)
    const openaiKey = process.env.OPENAI_API_KEY
    
    if (!openaiKey) {
      // Demo response if no key
      return NextResponse.json({ 
        response: "Demo mode: Please add your OpenAI API key to start chatting. You can enter it in your dashboard settings." 
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
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not respond.'
    
    return NextResponse.json({ response: reply })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ response: 'Something went wrong.' }, { status: 500 })
  }
}
