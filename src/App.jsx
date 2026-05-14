import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GroupDetail from './pages/GroupDetail'
import Balances from './pages/Balances'
import ExpenseDetail from './pages/ExpenseDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/group/:id" element={<GroupDetail />} />
        <Route path="/group/:id/balances" element={<Balances />} />
        <Route path="/group/:id/expense/:expenseId" element={<ExpenseDetail />} />
      </Routes>
    </BrowserRouter>
  )
}