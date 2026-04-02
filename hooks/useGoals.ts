import { useState, useEffect } from 'react'

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: 'RETIREMENT' | 'HOUSE' | 'EDUCATION' | 'TRAVEL' | 'OTHER'
  createdAt: string
}

interface GoalProgress {
  percentage: number
  remaining: number
  monthlyRequired: number
  daysLeft: number
  onTrack: boolean
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      })
      if (res.ok) {
        const newGoal = await res.json()
        setGoals(prev => [...prev, newGoal])
        return newGoal
      }
    } catch (error) {
      console.error('Failed to add goal:', error)
      throw error
    }
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (res.ok) {
        const updatedGoal = await res.json()
        setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g))
        return updatedGoal
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
      throw error
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setGoals(prev => prev.filter(g => g.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete goal:', error)
      throw error
    }
  }

  const calculateGoalProgress = (goal: Goal): GoalProgress => {
    const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
    const remaining = goal.targetAmount - goal.currentAmount
    
    const today = new Date()
    const deadline = new Date(goal.deadline)
    const daysLeft = Math.max(0, Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    
    const monthlyRequired = daysLeft > 0 ? remaining / (daysLeft / 30) : 0
    
    // Check if on track (assuming linear progress)
    const totalDays = Math.floor((deadline.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const daysPassed = Math.floor((today.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const expectedProgress = (daysPassed / totalDays) * 100
    const onTrack = percentage >= expectedProgress

    return {
      percentage,
      remaining,
      monthlyRequired,
      daysLeft,
      onTrack
    }
  }

  const updateGoalProgress = (goalId: string, currentAmount: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentAmount }
        : goal
    ))
  }

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    calculateGoalProgress,
    updateGoalProgress,
    fetchGoals
  }
}
