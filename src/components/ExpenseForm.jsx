import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ExpenseForm({ onExpenseAdded }) {
  const SCENARIO_OPTIONS = ['超市', '外卖', '堂食', '住房', '购物', '交通', '其他']
  
  const [formData, setFormData] = useState({
    amount: '',
    spender: 'Wang',
    scenario: '超市',
    expense_date: new Date().toISOString().split('T')[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!formData.scenario.trim()) {
      setError('Please enter a scenario')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          amount: parseFloat(formData.amount),
          spender: formData.spender,
          scenario: formData.scenario.trim(),
          expense_date: formData.expense_date
        })
        .select()
        .single()

      if (error) throw error

      setFormData({
        amount: '',
        spender: 'Wang',
        scenario: '超市',
        expense_date: new Date().toISOString().split('T')[0]
      })
      
      onExpenseAdded(data)
    } catch (err) {
      setError('Failed to save expense. Please try again.')
      console.error('Error saving expense:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Add Expense</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">€</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 text-2xl font-semibold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Spender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spender
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['Wang', 'Chen'].map((user) => (
              <button
                key={user}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, spender: user }))}
                className={`py-4 rounded-xl font-semibold transition-all ${
                  formData.spender === user
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {user}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scenario
          </label>
          <select
            name="scenario"
            value={formData.scenario}
            onChange={handleChange}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
          >
            {SCENARIO_OPTIONS.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleChange}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-danger-600 text-sm text-center">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-200"
        >
          {isSubmitting ? 'Saving...' : 'Save Expense'}
        </button>
      </form>
    </div>
  )
}
