import { useState } from 'react'
import { usePinAuth } from '../hooks/usePinAuth'

export default function PinScreen({ onAuthenticate, verifyPin }) {
  const [inputPin, setInputPin] = useState('')
  const { error, hasPin, changePin } = usePinAuth()
  const [isChangingPin, setIsChangingPin] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputPin.length === 4) {
      const success = verifyPin(inputPin)
      if (success) {
        onAuthenticate()
      }
    }
  }

  const handleChangePin = (e) => {
    e.preventDefault()
    if (newPin.length === 4 && newPin === confirmPin) {
      changePin(newPin)
      setIsChangingPin(false)
      setNewPin('')
      setConfirmPin('')
      alert('PIN changed successfully')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
          <p className="text-gray-500 mt-2">Enter your PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-4 text-2xl text-center tracking-[0.5em] border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-danger-600 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={inputPin.length !== 4}
            className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Unlock
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => setIsChangingPin(!isChangingPin)}
            className="w-full text-primary-600 text-sm font-medium hover:text-primary-700"
          >
            {isChangingPin ? 'Cancel' : 'Change PIN'}
          </button>
        </div>

        {isChangingPin && (
          <form onSubmit={handleChangePin} className="mt-4 space-y-3">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="New PIN (4 digits)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Confirm new PIN"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={newPin.length !== 4 || newPin !== confirmPin}
              className="w-full bg-gray-800 text-white py-2 rounded-lg font-medium hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save New PIN
            </button>
          </form>
        )}

        {!hasPin && (
          <p className="mt-4 text-xs text-gray-400 text-center">
            Default PIN: {import.meta.env.VITE_DEFAULT_PIN || '1234'}
          </p>
        )}
      </div>
    </div>
  )
}
