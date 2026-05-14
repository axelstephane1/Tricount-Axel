import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Connexion 👋</h1>
        <p className="text-gray-400 mb-6">Content de te revoir !</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex flex-col gap-3">
          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="border rounded-xl px-4 py-3"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button
            className="bg-violet-500 text-white py-3 rounded-xl font-bold mt-2"
            onClick={handleLogin}
          >
            Se connecter
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-violet-500 font-medium">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}