import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function JoinGroup({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Chargement...')

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/join/${id}`)
      return
    }
    joinGroup()
  }, [user])

  async function joinGroup() {
    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single()

    if (!group) { setStatus('Groupe introuvable.'); return }

    // Vérifie si déjà membre
    const { data: existing } = await supabase
      .from('group_members_auth')
      .select('*')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      await supabase.from('group_members_auth').insert({
        group_id: id,
        user_id: user.id
      })
    }

    navigate(`/group/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
      <p className="text-white text-xl">{status}</p>
    </div>
  )
}