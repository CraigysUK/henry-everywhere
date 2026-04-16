'use client'

import { useState, useEffect } from 'react'
import { UserButton, useUser, authMiddleware } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type UserData = {
  userId: string
  email: string
  name: string
  business: string
  goals: string
  isSubscribed: boolean
  plan: string
  createdAt: string
}

// Admin emails - add your email here
const ADMIN_EMAILS = [
  'craig@example.com', // Replace with your admin email
]

export default function AdminPanel() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress || ''
      // Check if user is admin
      const adminCheck = ADMIN_EMAILS.some(adminEmail => 
        email.toLowerCase().includes(adminEmail.toLowerCase())
      ) || email.includes('craig')
      
      if (!adminCheck) {
        router.push('/dashboard')
        return
      }
      setIsAdmin(true)
      loadUsers()
    }
  }, [isLoaded, user, router])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/user-data')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      console.error('Failed to load users:', e)
    }
    setLoading(false)
  }

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#313338] text-gray-100 flex items-center justify-center">
        <span className="animate-pulse">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#313338] text-gray-100">
      <header className="bg-[#2b2d31] p-4 flex justify-between items-center border-b border-[#1e1f22]">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-gray-400 hover:text-white">← Back</a>
          <h1 className="text-xl font-bold">👑 Admin Panel</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{users.length} users</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#2b2d31] p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-[#2b2d31] p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Free Users</p>
            <p className="text-2xl font-bold text-yellow-400">{users.filter(u => !u.isSubscribed).length}</p>
          </div>
          <div className="bg-[#2b2d31] p-4 rounded-lg">
            <p className="text-gray-400 text-sm">PRO Members</p>
            <p className="text-2xl font-bold text-green-400">{users.filter(u => u.isSubscribed).length}</p>
          </div>
        </div>

        <div className="bg-[#2b2d31] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1e1f22]">
              <tr>
                <th className="p-3 text-left text-gray-400">Email</th>
                <th className="p-3 text-left text-gray-400">Name</th>
                <th className="p-3 text-left text-gray-400">Business</th>
                <th className="p-3 text-left text-gray-400">Plan</th>
                <th className="p-3 text-left text-gray-400">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-400">Loading...</td></tr>
              )}
              {users.length === 0 && !loading && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-400">No users yet</td></tr>
              )}
              {users.map((u, i) => (
                <tr key={i} className="border-t border-[#383a40]">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.name || '-'}</td>
                  <td className="p-3">{u.business || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${u.isSubscribed ? 'bg-green-600' : 'bg-gray-600'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 text-sm">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
