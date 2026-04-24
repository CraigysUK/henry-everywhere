import Link from 'next/link'

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <header className="border-b border-slate-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏗️</span>
            <span className="text-xl font-bold text-amber-500">ContractPRO</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#services" className="hover:text-amber-400 transition">Services</a>
            <a href="#experience" className="hover:text-amber-400 transition">Experience</a>
            <a href="#contact" className="hover:text-amber-400 transition">Contact</a>
            <a href="/contracts-dashboard" className="text-amber-500 hover:text-amber-400">🤖 Try Contract AI Agent</a>
            <Link href="/" className="text-amber-500 hover:text-amber-400">← Back to AI</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Close Bigger Contracts in <span className="text-amber-500">Construction & FM</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Expert contract negotiation coaching for construction and facilities management companies. 
            I&apos;ve closed contracts worth <span className="text-amber-500 font-bold">billions of pounds</span>. 
            Now I help you do the same.
          </p>
          <a href="#contact" className="inline-block bg-amber-500 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition">
            Get a Free Consultation
          </a>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 px-6 bg-slate-800">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">How I Help</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-700 p-6 rounded-lg">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Strategy Review</h3>
              <p className="text-slate-300">We review your current approach to contract negotiations and identify gaps.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg">
              <div className="text-3xl mb-4">📞</div>
              <h3 className="text-xl font-bold mb-2">Coaching Calls</h3>
              <p className="text-slate-300">Live coaching on your active deals. I join the calls and guide you through.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-lg">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">In-Room Support</h3>
              <p className="text-slate-300">I attend key negotiations with you. Maximum impact for high-value deals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why I&apos;m Different</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-slate-800 p-6 rounded-lg">
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="text-xl font-bold text-amber-500">Director-Level Experience</h3>
                <p className="text-slate-300">Reached director level in corporate environments. I know how decisions get made.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-slate-800 p-6 rounded-lg">
              <span className="text-3xl">💰</span>
              <div>
                <h3 className="text-xl font-bold text-amber-500">Billions in Contracts</h3>
                <p className="text-slate-300">Successfully concluded contracts worth billions of pounds. Not theory — real results.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-slate-800 p-6 rounded-lg">
              <span className="text-3xl">🏗️</span>
              <div>
                <h3 className="text-xl font-bold text-amber-500">Construction & FM Specialist</h3>
                <p className="text-slate-300">Deep expertise in construction and facilities management. I speak your language.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-slate-800 p-6 rounded-lg">
              <span className="text-3xl">📜</span>
              <div>
                <h3 className="text-xl font-bold text-amber-500">Professional Accreditation</h3>
                <p className="text-slate-300">Fully accredited. You&apos;re working with a proven professional.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 bg-slate-800">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Flexible Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-700 p-8 rounded-lg text-center">
              <h3 className="text-xl font-bold mb-4">Project Fee</h3>
              <p className="text-slate-300 mb-4">One-time payment for specific deals</p>
              <p className="text-2xl font-bold text-amber-500">Bespoke Quote</p>
            </div>
            <div className="bg-slate-700 p-8 rounded-lg text-center">
              <h3 className="text-xl font-bold mb-4">Fractional</h3>
              <p className="text-slate-300 mb-4">Ongoing access for multiple deals</p>
              <p className="text-2xl font-bold text-amber-500">Monthly Retainer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Close Bigger Contracts?</h2>
          <p className="text-slate-300 mb-8">
            Book a free 15-minute call to discuss your needs and see if we&apos;re a good fit.
          </p>
          <a href="mailto:cjspartnersltd@outlook.com" className="inline-block bg-amber-500 text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition">
            Email Me: cjspartnersltd@outlook.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-700 text-center text-slate-400">
        <p>© 2026 ContractPRO. Construction & FM Contract Negotiation Experts.</p>
      </footer>
    </div>
  )
}
