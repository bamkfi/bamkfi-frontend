'use client'

import { MagicEdenBamkData } from '@/types'
import { createContext, useContext } from 'react'

export interface DataContextType {
	magicEdenBamkData?: MagicEdenBamkData
	nusdRuneData?: { amount: string }
	btcPriceData?: { bitcoin: { usd: number } }
	backingUSDValue?: number
	apy?: number
	tvl?: number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider = ({
	children,
	data
}: {
	children: React.ReactNode
	data: DataContextType
}) => <DataContext.Provider value={data}>{children}</DataContext.Provider>

export const useData = () => {
	const context = useContext(DataContext)
	if (!context) {
		throw new Error('useData must be used within a DataProvider')
	}
	return context
}
