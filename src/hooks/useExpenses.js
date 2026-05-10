import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getCurrentMonthRange = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    return {
      firstDay: firstDay.toISOString().split('T')[0],
      lastDay: lastDay.toISOString().split('T')[0]
    }
  }

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch expenses')
      console.error('Error fetching expenses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('expenses-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses'
        },
        () => {
          // Refetch when any change occurs
          fetchExpenses()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchExpenses])

  const addExpense = async (expenseData) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error adding expense:', err)
      throw err
    }
  }

  const deleteExpense = async (id) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      setExpenses(prev => prev.filter(exp => exp.id !== id))
    } catch (err) {
      console.error('Error deleting expense:', err)
      throw err
    }
  }

  return { expenses, loading, error, refreshExpenses: fetchExpenses, addExpense, deleteExpense }
}
