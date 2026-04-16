import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, email, name, business, goals, preferences, isSubscribed, plan } = await request.json()
    
    const userData = {
      userId,
      email,
      name: name || '',
      business: business || '',
      goals: goals || '',
      preferences: preferences || '',
      isSubscribed,
      plan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('USER DATA:', JSON.stringify(userData))
    
    return NextResponse.json({ success: true, userData })
  } catch (error) {
    console.error('Error saving user data:', error)
    return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ users: [] })
}
