import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function GroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [newMember, setNewMember] = useState('')
  const [expenses, setExpenses] = useState([])
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', paid_by: '', date: '', comment: '' })
  const [participants, setParticipants] = useState([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchGroup()
    fetchMembers()
    fetchExpenses()
  }, [])

  async function fetchGroup() {
    const { data } = await supabase.from('groups').select('*').eq('id', id).single()
    setGroup(data)
  }

  async function fetchMembers() {
    const { data } = await supabase.from('members').select('*').eq('group_id', id)
    setMembers(data || [])
  }

  async function fetchExpenses() {
    const { data } = await supabase
      .from('expenses')
      .select('*, paid_by_member:members!expenses_paid_by_fkey(name), expense_participants(member_id)')
      .eq('group_id', id)
    setExpenses(data || [])
  }

  async function addMember() {
    if (!newMember.trim()) return
    await supabase.from('members').insert({ group_id: id, name: newMember })
    setNewMember('')
    fetchMembers()
  }

  async function addExpense() {
    if (!newExpense.description || !newExpense.amount || !newExpense.paid_by || participants.length === 0) return
    const { data } = await supabase
  .from('expenses')
  .insert({ 
    group_id: id, 
    description: newExpense.description, 
    amount: parseFloat(newExpense.amount), 
    paid_by: newExpense.paid_by,
    date: newExpense.date || null,
    comment: newExpense.comment || null
  })
  .select()
  .single()

    await supabase.from('expense_participants').insert(
      participants.map(mid => ({ expense_id: data.id, member_id: mid }))
    )

    setNewExpense({ description: '', amount: '', paid_by: '' })
    setParticipants([])
    setShowForm(false)
    fetchExpenses()
  }

  function shareGroup() {
  const url = `${window.location.origin}/join/${id}`
  navigator.clipboard.writeText(url)
  alert('Lien copié ! 🎉')
}

  function toggleParticipant(mid) {
    setParticipants(prev =>
      prev.includes(mid) ? prev.filter(p => p !== mid) : [...prev, mid]
    )
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600">
      {/* Header */}
      <div className="p-6 pb-4">
        <button onClick={() => navigate('/')} className="text-violet-200 mb-4 flex items-center gap-1">
          ← Retour
        </button>
        
        <h1 className="text-2xl font-bold text-white">{group?.name}</h1>
        <p className="text-violet-200 mt-1">Total : {total}€</p>
      </div>

<button
  onClick={shareGroup}
  className="w-full bg-white/20 text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 mt-2"
>
  🔗 Inviter des amis
</button>

      {/* Contenu */}
      <div className="bg-gray-50 min-h-screen rounded-t-3xl p-6">

        {/* Membres */}
        <h2 className="font-bold text-gray-500 uppercase text-xs mb-3 tracking-wider">Membres</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {members.map(m => (
            <span key={m.id} className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
              {m.name}
            </span>
          ))}
          <div className="flex gap-2">
            <input
              className="border rounded-full px-3 py-1 text-sm outline-none"
              placeholder="+ Membre"
              value={newMember}
              onChange={e => setNewMember(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMember()}
            />
            <button onClick={addMember} className="bg-violet-500 text-white px-3 py-1 rounded-full text-sm">
              Ajouter
            </button>
          </div>
        </div>

        {/* Dépenses */}
        <div className="flex items-center justify-between mb-3 mt-6">
          <h2 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Dépenses</h2>
          <button
            className="bg-violet-500 text-white px-4 py-1.5 rounded-full text-sm font-medium"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Annuler' : '+ Ajouter'}
          </button>
        </div>

        {/* Formulaire dépense */}
        {showForm && (
  <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex flex-col gap-3">
    <input
      className="border rounded-xl px-3 py-2 text-sm"
      placeholder="Description"
      value={newExpense.description}
      onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
    />
    <input
      className="border rounded-xl px-3 py-2 text-sm"
      placeholder="Montant (€)"
      type="number"
      value={newExpense.amount}
      onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
    />
    <select
      className="border rounded-xl px-3 py-2 text-sm"
      value={newExpense.paid_by}
      onChange={e => setNewExpense({ ...newExpense, paid_by: e.target.value })}
    >
      <option value="">Payé par...</option>
      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
    </select>
    <input
      className="border rounded-xl px-3 py-2 text-sm"
      type="date"
      value={newExpense.date || ''}
      onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
    />
    <textarea
      className="border rounded-xl px-3 py-2 text-sm resize-none"
      rows={2}
      placeholder="Commentaire (optionnel)"
      value={newExpense.comment || ''}
      onChange={e => setNewExpense({ ...newExpense, comment: e.target.value })}
    />
    <button
  type="button"
  onClick={() => setParticipants(participants.length === members.length ? [] : members.map(m => m.id))}
  className="text-violet-500 text-sm underline text-left"
>
  {participants.length === members.length ? 'Tout désélectionner' : 'Tout sélectionner'}
</button>
    <p className="text-xs text-gray-500 font-medium">Participants :</p>
    <div className="flex flex-wrap gap-2">
      {members.map(m => (
        <button
          key={m.id}
          onClick={() => toggleParticipant(m.id)}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            participants.includes(m.id)
              ? 'bg-violet-500 text-white border-violet-500'
              : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          {m.name}
        </button>
      ))}
    </div>
    <button className="bg-green-500 text-white py-2 rounded-xl font-medium" onClick={addExpense}>
      Ajouter la dépense
    </button>
  </div>
)}

        {/* Liste dépenses */}
        <div className="flex flex-col gap-3">
          {expenses.map(exp => (
            <div
              key={exp.id}
              className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/group/${id}/expense/${exp.id}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{exp.description}</p>
                  <p className="text-sm text-gray-400">payé par {exp.paid_by_member?.name}</p>
                </div>
                <span className="text-lg font-bold text-violet-600">{exp.amount}€</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton balances */}
        <button
          className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg"
          onClick={() => navigate(`/group/${id}/balances`)}
        >
          Voir les balances →
        </button>
      </div>
    </div>
  )
}