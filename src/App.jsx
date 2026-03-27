import { useExpenses } from './hooks/useExpenses'
import { usePinAuth } from './hooks/usePinAuth'
import PinScreen from './components/PinScreen'
import ExpenseForm from './components/ExpenseForm'
import BudgetAlert from './components/BudgetAlert'
import SpendingByScenario from './components/SpendingByScenario'
import SpendingBySpender from './components/SpendingBySpender'
import MonthlyTrend from './components/MonthlyTrend'

function Dashboard({ onLogout }) {
  const { expenses, loading, refreshExpenses, deleteExpense } = useExpenses()

  const handleExpenseAdded = () => {
    refreshExpenses()
  }

  const formatCurrency = (amount) => {
    return `€${parseFloat(amount).toFixed(2)}`
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 text-white px-4 py-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Expense Tracker</h1>
            <p className="text-sm text-primary-100">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
            aria-label="Logout"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 flex-1 pb-8">
        {/* Budget Alert */}
        <BudgetAlert expenses={expenses} />

        {/* Add Expense Form */}
        <ExpenseForm onExpenseAdded={handleExpenseAdded} />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="text-2xl font-bold text-gray-800">{expenses.length}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <SpendingBySpender expenses={expenses} />
          <SpendingByScenario expenses={expenses} />
          <MonthlyTrend expenses={expenses} />
        </div>

        {/* Recent Expenses List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Expenses</h3>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expenses yet. Add your first one!</p>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 10).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      expense.spender === 'Wang' ? 'bg-primary-100 text-primary-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {expense.spender === 'Wang' ? 'W' : 'C'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{expense.scenario}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                      aria-label="Delete expense"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-xs">
        <p>Shared Expense Tracker PWA</p>
        <p>Data syncs automatically across devices</p>
      </footer>
    </div>
  )
}

function App() {
  const { isAuthenticated, verifyPin, logout } = usePinAuth()

  return isAuthenticated ? <Dashboard onLogout={logout} /> : <PinScreen onAuthenticate={() => {}} verifyPin={verifyPin} />
}

export default App
