import type { Portfolio, Trade } from '@/types/finance'

export interface Scenario {
  name: string
  description: string
  monthlyInvestment: number
  years: number
  expectedReturn: number
  totalInvested: number
  finalValue: number
  totalReturn: number
  returnPercentage: number
}

export interface WhatIfParams {
  currentPortfolio: Portfolio[]
  trades: Trade[]
  monthlyInvestment: number
  expectedReturn: number
  years: number
}

export function calculateWhatIfScenarios(params: WhatIfParams): Scenario[] {
  const { currentPortfolio, trades, monthlyInvestment, expectedReturn, years } = params
  
  // Calculate current portfolio value
  const currentValue = currentPortfolio.reduce((sum, portfolio) => {
    const portfolioTrades = trades.filter(t => t.portfolioId === portfolio.id)
    const totalQuantity = portfolioTrades.reduce((sum, t) => sum + Number(t.quantity), 0)
    return sum + (totalQuantity * Number(portfolio.currentPrice))
  }, 0)

  const monthlyRate = expectedReturn / 100 / 12
  const totalMonths = years * 12

  const scenarios: Scenario[] = []

  // Scenario 1: Continue current strategy
  const futureValue1 = currentValue * Math.pow(1 + monthlyRate, totalMonths) + 
                      monthlyInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
  const totalInvested1 = currentValue + (monthlyInvestment * totalMonths)
  
  scenarios.push({
    name: 'Continue Current Strategy',
    description: `ลงทุน $${monthlyInvestment}/เดือน ด้วยผลตอบแทน ${expectedReturn}%/ปี`,
    monthlyInvestment,
    years,
    expectedReturn,
    totalInvested: totalInvested1,
    finalValue: futureValue1,
    totalReturn: futureValue1 - totalInvested1,
    returnPercentage: ((futureValue1 - totalInvested1) / totalInvested1) * 100
  })

  // Scenario 2: Increase investment by 50%
  const increasedInvestment = monthlyInvestment * 1.5
  const futureValue2 = currentValue * Math.pow(1 + monthlyRate, totalMonths) + 
                      increasedInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
  const totalInvested2 = currentValue + (increasedInvestment * totalMonths)
  
  scenarios.push({
    name: 'Increase Investment 50%',
    description: `ลงทุน $${increasedInvestment.toFixed(0)}/เดือน (เพิ่ม 50%)`,
    monthlyInvestment: increasedInvestment,
    years,
    expectedReturn,
    totalInvested: totalInvested2,
    finalValue: futureValue2,
    totalReturn: futureValue2 - totalInvested2,
    returnPercentage: ((futureValue2 - totalInvested2) / totalInvested2) * 100
  })

  // Scenario 3: Higher return expectation
  const higherReturn = expectedReturn + 5
  const higherMonthlyRate = higherReturn / 100 / 12
  const futureValue3 = currentValue * Math.pow(1 + higherMonthlyRate, totalMonths) + 
                      monthlyInvestment * ((Math.pow(1 + higherMonthlyRate, totalMonths) - 1) / higherMonthlyRate)
  const totalInvested3 = currentValue + (monthlyInvestment * totalMonths)
  
  scenarios.push({
    name: 'Higher Return Expectation',
    description: `ผลตอบแทน ${higherReturn}%/ปี (เพิ่ม 5%)`,
    monthlyInvestment,
    years,
    expectedReturn: higherReturn,
    totalInvested: totalInvested3,
    finalValue: futureValue3,
    totalReturn: futureValue3 - totalInvested3,
    returnPercentage: ((futureValue3 - totalInvested3) / totalInvested3) * 100
  })

  // Scenario 4: Longer time horizon
  const longerYears = years + 5
  const longerMonths = longerYears * 12
  const futureValue4 = currentValue * Math.pow(1 + monthlyRate, longerMonths) + 
                      monthlyInvestment * ((Math.pow(1 + monthlyRate, longerMonths) - 1) / monthlyRate)
  const totalInvested4 = currentValue + (monthlyInvestment * longerMonths)
  
  scenarios.push({
    name: 'Longer Time Horizon',
    description: `ลงทุนนาน ${longerYears} ปี (เพิ่ม 5 ปี)`,
    monthlyInvestment,
    years: longerYears,
    expectedReturn,
    totalInvested: totalInvested4,
    finalValue: futureValue4,
    totalReturn: futureValue4 - totalInvested4,
    returnPercentage: ((futureValue4 - totalInvested4) / totalInvested4) * 100
  })

  // Scenario 5: Conservative approach
  const conservativeReturn = Math.max(3, expectedReturn - 3)
  const conservativeMonthlyRate = conservativeReturn / 100 / 12
  const futureValue5 = currentValue * Math.pow(1 + conservativeMonthlyRate, totalMonths) + 
                      monthlyInvestment * ((Math.pow(1 + conservativeMonthlyRate, totalMonths) - 1) / conservativeMonthlyRate)
  const totalInvested5 = currentValue + (monthlyInvestment * totalMonths)
  
  scenarios.push({
    name: 'Conservative Approach',
    description: `ผลตอบแทน ${conservativeReturn}%/ปี (ลดความเสี่ยง)`,
    monthlyInvestment,
    years,
    expectedReturn: conservativeReturn,
    totalInvested: totalInvested5,
    finalValue: futureValue5,
    totalReturn: futureValue5 - totalInvested5,
    returnPercentage: ((futureValue5 - totalInvested5) / totalInvested5) * 100
  })

  return scenarios.sort((a, b) => b.finalValue - a.finalValue)
}

export function calculateGoalProjection(
  currentAmount: number,
  targetAmount: number,
  monthlyInvestment: number,
  expectedReturn: number
): { monthsRequired: number; yearsRequired: number; achievable: boolean } {
  const monthlyRate = expectedReturn / 100 / 12
  
  // Calculate months required to reach goal
  // Formula: FV = PV(1+r)^n + PMT * [((1+r)^n - 1)/r]
  // We need to solve for n, which requires iterative approach
  
  let monthsRequired = 0
  let maxMonths = 600 // 50 years max
  
  for (let n = 1; n <= maxMonths; n++) {
    const futureValue = currentAmount * Math.pow(1 + monthlyRate, n) + 
                      monthlyInvestment * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate)
    
    if (futureValue >= targetAmount) {
      monthsRequired = n
      break
    }
  }
  
  return {
    monthsRequired,
    yearsRequired: monthsRequired / 12,
    achievable: monthsRequired > 0 && monthsRequired <= maxMonths
  }
}
