'use client'

import { CustomConnectKitButton } from '@/components/ConnectKitButton';
import { Button } from '@/components/ui/button';
import { nunito } from '@/components/ui/fonts'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { useSIWE } from 'connectkit';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { CircleCheckIcon } from '@/icons/CircleCheckIcon';
import { WarningOutlineIcon } from '@/icons/WarningOutlineIcon';

export default function AuthorizedMinterDashboard() {
    const siwe = useSIWE();
    const account = useAccount();
    const unminted = useQuery({
        queryKey: ['unminted', account.address],
        queryFn: () => fetch(
                `/api/autoswap/admin?${new URLSearchParams({ eth_account: account.address as string }).toString()}`
            ).then(res => {
                if (res.ok) {
                    return res.json()
                }
                else toast.error(`Error loading data (${res.status} ${res.statusText})`)
            }),
        enabled: account.isConnected && siwe.isSignedIn,
    })
	const [refreshTimeout, setRefreshTimeout] = useState(false)
	const handleRefresh = async () => {
		setRefreshTimeout(true)
		const result = await unminted.refetch()
        if (result.isSuccess) {
            toast.success("Refresh successful")
        } else {
            toast.error(`Refresh error${result.error?.message ? ` (${result.error.message})` : '' })`)
        }
		setTimeout(() => {
			setRefreshTimeout(false)
		}, 5_000)
	}
    if (!account.isConnected || !siwe.isSignedIn) {
        return <div className='container text-center mt-8'>
            <CustomConnectKitButton />
        </div>
    }
	return (
		<div className="max-w-screen-xl container flex flex-col sm:mt-8 mb-4">
			<div className="mx-3 md:mx-8 flex justify-between items-end flex-wrap">
                <h1 className={classNames(nunito.className, 'text-3xl mt-2 mb-4')}>
                    Minter Dashboard
                </h1>
                <Button className='mb-4' onClick={handleRefresh} disabled={unminted.isFetching || refreshTimeout} variant="outline">
                    Refresh
                </Button>
                <div className='mb-4'>
                    <CustomConnectKitButton />
                </div>
			</div>
            {unminted.data?.deposits?.length ? (
                <div className="relative overflow-x-auto shadow-md rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-zinc-400">
                        <thead className="text-xs uppercase bg-zinc-700 text-zinc-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Order Created
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Order ID
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Payment TXID
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Mint To Address
                                </th>
                                <th scope="col" className="px-6 py-3 text-right">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    BTC Transfer TXID
                                </th>
                                <th scope="col" className="px-6 py-3 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {unminted.data.deposits?.map((data: any) => {
                                return <TableRow key={data.uuid} data={data} />
                            })}
                        </tbody>
                    </table>
                </div>
            ) : unminted.isFetching ? (
                <div className='text-center'>Loading...</div>
            ) : (
                <div className='text-center'>No new deposits.</div>
            )}
		</div>
	)
}

function TableRow({ data }: {
    data: any
}) {
    const account = useAccount()
    const [btcTxid, setBtcTxid] = useState('')
    const [pendingSaveBtcTxid, setPendingBtcTxid] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaveResult, setLastSaveResult] = useState<'success' | 'error' | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const handleSave = async () => {
        try {
            setIsSaving(true)
            const result = await fetch(
                `/api/autoswap/admin`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        eth_account: account.address,
                        uuid: data.uuid,
                        btc_txid: btcTxid,
                    }),
                }
            )
            if (!result.ok) {
                throw new Error("Error saving")
            }
            setBtcTxid(pendingSaveBtcTxid)
            setLastSaveResult('success')
            setIsEditing(false)
            toast.success("Saved")
        } catch (e: any) {
            toast.error(e.message)
            setLastSaveResult("error")
        } finally {
            setIsSaving(false)
        }
    }
    const handleEdit = () => setIsEditing(true)
    const handleCancel = () => {
        setIsEditing(false)
        setPendingBtcTxid(btcTxid)
        if (btcTxid) {
            setLastSaveResult("success")
        } else {
            setLastSaveResult(null)
        }
    }
    return (
        <tr className="border-b bg-zinc-800 border-zinc-700 font-mono">
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {new Date(parseInt(data.timestamp) * 1000).toLocaleString()}
            </td>
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {data.uuid}
            </td>
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {data.eth_txid}
            </td>
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {data.to_btc_address}
            </td>
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {(BigInt(data.from_usde_amount) / BigInt(10 ** 18)).toLocaleString()}
            </td>
            <td className="px-6 py-4 text-right flex gap-2 items-center">
                <input
                    type="text"
                    value={pendingSaveBtcTxid}
                    onChange={(e) => {
                        setPendingBtcTxid(e.target.value)
                    }}
                    disabled={!isEditing}
                    className={classNames(
                        'bg-zinc-300 text-black w-[68ch] text-center font-mono text-sm gap-2 px-2 py-2 rounded-md border focus:ring-primary focus:border-primary',
                        { 'bg-zinc-600 pointer-events-none': !isEditing},
                    )}
                />
                {lastSaveResult === 'success' && !isEditing ? <CircleCheckIcon size="1rem" fill="rgb(60, 179, 113)" /> 
                : lastSaveResult === 'error' ? <WarningOutlineIcon size="1rem" fill="rgb(205, 92, 92)" /> 
                : null}
            </td>
            <td>
                <div className="px-6 py-4 text-right flex gap-2 items-center">
                    <Button
                        onClick={handleCancel}
                        disabled={!isEditing}
                        variant="destructive"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEdit}
                        disabled={isEditing}
                        variant="secondary"
                    >
                        Edit
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || btcTxid === pendingSaveBtcTxid}
                    >
                        Save
                    </Button>
                </div>
            </td>
        </tr> 
    )
}