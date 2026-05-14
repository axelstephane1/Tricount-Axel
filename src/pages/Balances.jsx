import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Balances() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [balances, setBalances] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: members } = await supabase.from('members').select('*').eq('group_id', id)
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*, expense_participants(member_id)')
      .eq('group_id', id)

    calculateBalances(members || [], expenses || [])
  }

  function calculateBalances(members, expenses) {
    const balance = {}
    members.forEach(m => balance[m.id] = 0)

    expenses.forEach(exp => {
      const parts = exp.expense_participants
      const share = exp.amount / parts.length
      balance[exp.paid_by] += exp.amount
      parts.forEach(p => { balance[p.member_id] -= share })
    })

    const debtors = members.filter(m => balance[m.id] < -0.01)
    const creditors = members.filter(m => balance[m.id] > 0.01)
    const transactions = []

    debtors.forEach(debtor => {
      let remaining = Math.abs(balance[debtor.id])
      creditors.forEach(creditor => {
        if (balance[creditor.id] > 0.01 && remaining > 0.01) {
          const amount = Math.min(remaining, balance[creditor.id])
          transactions.push({ from: debtor.name, to: creditor.name, amount: amount.toFixed(2) })
          remaining -= amount
          balance[creditor.id] -= amount
        }
      })
    })

    setBalances(transactions)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600">
      <div className="p-6 pb-4">
        <button onClick={() => navigate(`/group/${id}`)} className="text-violet-200 mb-4">← Retour</button>
        <h1 className="text-2xl font-bold text-white">Balances</h1>
        <p className="text-violet-200 mt-1">Qui doit quoi à qui ?</p>
      </div>

      <div className="bg-gray-50 min-h-screen rounded-t-3xl p-6">
        {balances.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-xl font-bold text-gray-700">Tout est équilibré !</p>
            <p className="text-gray-400 mt-2">Personne ne doit rien à personne</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {balances.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      💸
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{b.from}</p>
                      <p className="text-sm text-gray-400">doit à {b.to}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-red-500">{b.amount}€</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}