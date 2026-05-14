import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function ExpenseDetail() {
  const { id, expenseId } = useParams()
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [expense, setExpense] = useState({ description: '', amount: '', paid_by: '', date: '', comment: '' })
  const [participants, setParticipants] = useState([])

  useEffect(() => {
    fetchMembers()
    fetchExpense()
  }, [])

  async function fetchMembers() {
    const { data } = await supabase.from('members').select('*').eq('group_id', id)
    setMembers(data || [])
  }

  async function fetchExpense() {
    const { data } = await supabase
      .from('expenses')
      .select('*, expense_participants(member_id)')
      .eq('id', expenseId)
      .single()
    setExpense(data)
    setParticipants(data.expense_participants.map(p => p.member_id))
  }

  function toggleParticipant(mid) {
    setParticipants(prev =>
      prev.includes(mid) ? prev.filter(p => p !== mid) : [...prev, mid]
    )
  }

  async function saveExpense() {
    await supabase.from('expenses').update({
      description: expense.description,
      amount: parseFloat(expense.amount),
      paid_by: expense.paid_by,
      date: expense.date,
      comment: expense.comment
    }).eq('id', expenseId)

    await supabase.from('expense_participants').delete().eq('expense_id', expenseId)
    await supabase.from('expense_participants').insert(
      participants.map(mid => ({ expense_id: expenseId, member_id: mid }))
    )

    navigate(`/group/${id}`)
  }

  async function deleteExpense() {
    await supabase.from('expense_participants').delete().eq('expense_id', expenseId)
    await supabase.from('expenses').delete().eq('id', expenseId)
    navigate(`/group/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600">
      <div className="p-6 pb-4">
        <button onClick={() => navigate(`/group/${id}`)} className="text-violet-200 mb-4">← Retour</button>
        <h1 className="text-2xl font-bold text-white">Modifier la dépense</h1>
      </div>

      <div className="bg-gray-50 min-h-screen rounded-t-3xl p-6">
        <div className="flex flex-col gap-3">

          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
          <input
            className="border rounded-xl px-4 py-3"
            value={expense.description || ''}
            onChange={e => setExpense({ ...expense, description: e.target.value })}
          />

          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Montant (€)</label>
          <input
            className="border rounded-xl px-4 py-3"
            type="number"
            value={expense.amount || ''}
            onChange={e => setExpense({ ...expense, amount: e.target.value })}
          />

          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payé par</label>
          <select
            className="border rounded-xl px-4 py-3"
            value={expense.paid_by || ''}
            onChange={e => setExpense({ ...expense, paid_by: e.target.value })}
          >
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
          <input
            className="border rounded-xl px-4 py-3"
            type="date"
            value={expense.date || ''}
            onChange={e => setExpense({ ...expense, date: e.target.value })}
          />

          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commentaire</label>
          <textarea
            className="border rounded-xl px-4 py-3 resize-none"
            rows={3}
            placeholder="Ajouter une note..."
            value={expense.comment || ''}
            onChange={e => setExpense({ ...expense, comment: e.target.value })}
          />
<button
  type="button"
  onClick={() => setParticipants(participants.length === members.length ? [] : members.map(m => m.id))}
  className="text-violet-500 text-sm underline text-left"
>
  {participants.length === members.length ? 'Tout désélectionner' : 'Tout sélectionner'}
</button>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Participants</label>
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

          <button className="bg-violet-500 text-white py-3 rounded-xl font-bold mt-2" onClick={saveExpense}>
            Sauvegarder
          </button>
          <button className="bg-red-500 text-white py-3 rounded-xl font-bold" onClick={deleteExpense}>
            Supprimer la dépense
          </button>
        </div>
      </div>
    </div>
  )
}