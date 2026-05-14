import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Home from './pages/Home'
import GroupDetail from './pages/GroupDetail'
import Balances from './pages/Balances'
import ExpenseDetail from './pages/ExpenseDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import JoinGroup from './pages/JoinGroup'

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
      <p className="text-white text-xl">Chargement...</p>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute user={user}><Home user={user} /></PrivateRoute>} />
        <Route path="/group/:id" element={<PrivateRoute user={user}><GroupDetail user={user} /></PrivateRoute>} />
        <Route path="/group/:id/balances" element={<PrivateRoute user={user}><Balances /></PrivateRoute>} />
        <Route path="/group/:id/expense/:expenseId" element={<PrivateRoute user={user}><ExpenseDetail /></PrivateRoute>} />
        <Route path="/join/:id" element={<JoinGroup user={user} />} />
      </Routes>
    </BrowserRouter>
  )
}