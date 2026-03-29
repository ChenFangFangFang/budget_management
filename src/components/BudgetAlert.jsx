import { useMemo, useState } from 'react'
import { useBudget } from '../hooks/useBudget'

export default function BudgetAlert({ expenses }) {
  const { monthlyBudget, updateBudget, loading } = useBudget()
  const [isEditing, setIsEditing] = useState(false)
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString())

  const currentMonthTotal = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.expense_date)
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
  }, [expenses])

  const percentageUsed = (currentMonthTotal / monthlyBudget) * 100
  const isOverBudget = currentMonthTotal > monthlyBudget
  const isNearBudget = percentageUsed >= 80 && !isOverBudget

  const handleBudgetChange = (e) => {
    const value = e.target.value
      .replace(/,/g, '.')
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1')
    setTempBudget(value.startsWith('.') ? '0' + value : value)
  }

  const handleSaveBudget = async () => {
    const newBudget = parseFloat(tempBudget)
    if (newBudget > 0) {
      await updateBudget(newBudget)
      setIsEditing(false)
    }
  }

  const getAlertStyles = () => {
    if (isOverBudget) {
      return {
        bg: 'bg-danger-100',
        border: 'border-danger-500',
        text: 'text-danger-700',
        icon: 'text-danger-600',
        progress: 'bg-danger-500'
      }
    }
    if (isNearBudget) {
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-500',
        text: 'text-yellow-700',
        icon: 'text-yellow-600',
        progress: 'bg-yellow-500'
      }
    }
    return {
      bg: 'bg-primary-100',
      border: 'border-primary-500',
      text: 'text-primary-700',
      icon: 'text-primary-600',
      progress: 'bg-primary-500'
    }
  }

  const styles = getAlertStyles()

  if (loading) {
    return (
      <div className={`${styles.bg} border-2 ${styles.border} rounded-2xl p-6 mb-6`}>
        <div className="animate-pulse h-4 bg-white/50 rounded w-32"></div>
      </div>
    )
  }

  return (
    <div className={`${styles.bg} border-2 ${styles.border} rounded-2xl p-6 mb-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={styles.icon}>
            {isOverBudget ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${styles.text}`}>
              {isOverBudget ? 'Budget Exceeded!' : isNearBudget ? 'Budget Warning' : 'Budget Status'}
            </h3>
            <p className={`text-sm ${styles.text} opacity-80`}>
              {isOverBudget 
                ? `€${currentMonthTotal.toFixed(2)} / €${monthlyBudget.toFixed(2)}`
                : `€${currentMonthTotal.toFixed(2)} spent of €${monthlyBudget.toFixed(2)} budget`
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setIsEditing(!isEditing)
            setTempBudget(monthlyBudget.toString())
          }}
          className={`text-sm ${styles.text} opacity-60 hover:opacity-100`}
        >
          {isEditing ? '✕' : '⚙'}
        </button>
      </div>

      {isEditing ? (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            inputMode="decimal"
            value={tempBudget}
            onChange={handleBudgetChange}
            className="flex-1 px-3 py-2 border-2 border-white rounded-lg focus:outline-none focus:border-primary-300"
          />
          <button
            onClick={handleSaveBudget}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="relative pt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className={styles.text}>{percentageUsed.toFixed(0)}% used</span>
            <span className={styles.text}>
              {isOverBudget
                ? `€${(currentMonthTotal - monthlyBudget).toFixed(2)} over`
                : `€${(monthlyBudget - currentMonthTotal).toFixed(2)} remaining`
              }
            </span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
            <div
              className={`${styles.progress} h-full rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>
      )}

      {isOverBudget && (
        <p className={`mt-3 text-sm ${styles.text} font-medium`}>
          ⚠ You've exceeded your monthly budget by €{(currentMonthTotal - monthlyBudget).toFixed(2)}
        </p>
      )}

      {isNearBudget && (
        <p className={`mt-3 text-sm ${styles.text} font-medium`}>
          ⚠ You're approaching your monthly budget limit
        </p>
      )}
    </div>
  )
}
