import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Home({ user }) {
  const [groups, setGroups] = useState([])
  const [newName, setNewName] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchGroups() }, [])

  async function fetchGroups() {
    const { data } = await supabase
      .from('group_members_auth')
      .select('group_id, groups(*)')
      .eq('user_id', user.id)
    setGroups(data?.map(d => d.groups) || [])
  }

  async function createGroup() {
    if (!newName.trim()) return
    const { data } = await supabase
      .from('groups')
      .insert({ name: newName, owner_id: user.id })
      .select()
      .single()

    await supabase.from('group_members_auth').insert({
      group_id: data.id,
      user_id: user.id
    })

    setNewName('')
    fetchGroups()
  }

  async function deleteGroup(groupId) {
    await supabase.from('groups').delete().eq('id', groupId)
    fetchGroups()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">SplitEasy 💸</h1>
          <button onClick={handleLogout} className="text-violet-200 text-sm">
            Déconnexion
          </button>
        </div>
        <p className="text-violet-200 mb-8">Bonjour {user.user_metadata?.name || user.email} 👋</p>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 rounded-xl px-4 py-3 bg-white/20 text-white placeholder-violet-200 outline-none focus:bg-white/30"
            placeholder="Nom du groupe..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createGroup()}
          />
          <button
            className="bg-white text-violet-600 font-bold px-5 py-3 rounded-xl hover:bg-violet-50"
            onClick={createGroup}
          >
            +
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => navigate(`/group/${group.id}`)}
              >
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl">
                  🧳
                </div>
                <span className="font-semibold text-gray-800">{group.name}</span>
              </div>
              <button
                className="text-gray-300 hover:text-red-400 text-xl ml-2"
                onClick={() => deleteGroup(group.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center text-violet-200 mt-12">
            <p className="text-4xl mb-3">🌍</p>
            <p>Crée ton premier groupe !</p>
          </div>
        )}
      </div>
    </div>
  )
}