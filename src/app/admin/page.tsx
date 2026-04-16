'use client'

import { useState, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
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

// Main admin - cannot be changed
const MAIN_ADMIN_EMAIL = 'cjspartnersltd@outlook.com'
  
  // Check if current user is admin in dashboard
  export const isAdminUser = (email: string) => email.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase()
const ADMIN_PASSWORD = 'Henry2026!'

export default function AdminPanel() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [passwordEntered, setPasswordEntered] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  
  // Manage additional admins
  const [additionalAdmins, setAdditionalAdmins] = useState<string[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState('')

  useEffect(() => {
    // Load additional admins from localStorage
    const saved = localStorage.getItem('admin_emails')
    if (saved) {
      setAdditionalAdmins(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress || ''
      const allAdmins = [MAIN_ADMIN_EMAIL, ...additionalAdmins]
      const isAdminEmail = allAdmins.some(admin => 
        email.toLowerCase() === admin.toLowerCase()
      )
      
      if (!isAdminEmail) {
        router.push('/dashboard')
        return
      }
      setIsAdmin(true)
    }
  }, [isLoaded, user, router, additionalAdmins])

  const checkPassword = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setPasswordEntered(true)
      setPasswordError(false)
      loadUsers()
    } else {
      setPasswordError(true)
    }
  }

  const addAdmin = () => {
    if (newAdminEmail && !additionalAdmins.includes(newAdminEmail)) {
      const updated = [...additionalAdmins, newAdminEmail]
      setAdditionalAdmins(updated)
      localStorage.setItem('admin_emails', JSON.stringify(updated))
      setNewAdminEmail('')
    }
  }

  const removeAdmin = (email: string) => {
    const updated = additionalAdmins.filter(a => a !== email)
    setAdditionalAdmins(updated)
    localStorage.setItem('admin_emails', JSON.stringify(updated))
  }

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

  if (!passwordEntered) {
    return (
      <div className="min-h-screen bg-[#313338] text-gray-100 flex items-center justify-center">
        <div className="bg-[#2b2d31] p-8 rounded-lg max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-center">🔐 Admin Access</h2>
          <p className="text-gray-400 text-sm mb-4 text-center">Enter password to continue</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
            placeholder="Password"
            className="w-full p-3 bg-[#383a40] border-none rounded-lg text-gray-100 mb-3"
          />
          {passwordError && <p className="text-red-400 text-sm mb-3">Incorrect password</p>}
          <button onClick={checkPassword} className="w-full bg-[#5865F2] text-white py-3 rounded-lg font-bold hover:bg-[#4752c4]">
            Enter
          </button>
        </div>
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
        {/* Stats */}
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

        {/* Manage Admins */}
        <div className="bg-[#2b2d31] p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold mb-4">👥 Manage Admins</h2>
          <p className="text-gray-400 text-sm mb-3">Main admin: {MAIN_ADMIN_EMAIL}</p>
          
          {additionalAdmins.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-2">Additional admins:</p>
              {additionalAdmins.map((email, i) => (
                <div key={i} className="flex justify-between items-center bg-[#383a40] p-2 rounded mb-1">
                  <span className="text-sm">{email}</span>
                  <button onClick={() => removeAdmin(email)} className="text-red-400 text-sm hover:text-red-300">Remove</button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Add admin email..."
              className="flex-1 p-2 bg-[#383a40] border-none rounded text-gray-100 text-sm"
            />
            <button onClick={addAdmin} className="bg-[#5865F2] text-white px-4 py-2 rounded font-medium hover:bg-[#4752c4]">
              Add
            </button>
          </div>
        </div>

        {/* Users Table */}
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
              {loading && <tr><td colSpan={5} className="p-4 text-center text-gray-400">Loading...</td></tr>}
              {users.length === 0 && !loading && <tr><td colSpan={5} className="p-4 text-center text-gray-400">No users yet</td></tr>}
              {users.map((u, i) => (
                <tr key={i} className="border-t border-[#383a40]">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.name || '-'}</td>
                  <td className="p-3">{u.business || '-'}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${u.isSubscribed ? 'bg-green-600' : 'bg-gray-600'}`}>{u.plan}</span></td>
                  <td className="p-3 text-gray-400 text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
