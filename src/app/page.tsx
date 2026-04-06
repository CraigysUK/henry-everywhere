import Link from 'next/link'
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Henry Everywhere 🦊</h1>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-semibold transition">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Your Own Personal AI Agent
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Create your own Henry. Name it, teach it, let it help you. 
          Just like having a brilliant assistant who never forgets.
        </p>
        
        <div className="flex gap-4 justify-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-white text-purple-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition">
                Get Started Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="bg-white text-purple-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition">
                Go to Dashboard →
              </button>
            </Link>
          </SignedIn>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur p-8 rounded-2xl">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-white mb-2">Train Your Way</h3>
            <p className="text-gray-300">
              Upload documents, give instructions, teach your AI anything you want.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur p-8 rounded-2xl">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-white mb-2">Natural Chat</h3>
            <p className="text-gray-300">
              Chat naturally. Your AI remembers everything you&apos;ve discussed.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur p-8 rounded-2xl">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-white mb-2">Connect Tools</h3>
            <p className="text-gray-300">
              Link your email, calendar, and more. Let your AI do the work.
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-white mb-8">Simple Pricing</h3>
          <div className="bg-white/10 backdrop-blur inline-block p-8 rounded-2xl">
            <div className="text-5xl font-bold text-green-400 mb-2">£24.95</div>
            <p className="text-gray-300 mb-4">per month</p>
            <ul className="text-left text-gray-300 space-y-2">
              <li>✓ Your own AI agent</li>
              <li>✓ Name it whatever you want</li>
              <li>✓ Train it your way</li>
              <li>✓ Remembers conversations</li>
              <li>✓ Web chat access</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-gray-400">
          <p>© 2026 Henry Everywhere. Built for everyone.</p>
        </footer>
      </main>
    </div>
  )
}
