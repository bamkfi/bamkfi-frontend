'use client'

import { Button } from '@/components/ui/button';
import { nunito } from '@/components/ui/fonts'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { useState } from 'react';
import { toast } from 'react-toastify';
import { CircleCheckIcon } from '@/icons/CircleCheckIcon';
import { WarningOutlineIcon } from '@/icons/WarningOutlineIcon';
import { useWallet } from '@/components/providers/BtcWalletProvider';
import type { Redeem } from '@/app/swap/redeem/history/RedeemHistory';

export default function AuthorizedRedeemerDashboard() {
    const wallet = useWallet()
    const paidOrders = useQuery<{
        redeems: Redeem[]
    }>({
        queryKey: ['paid-orders', wallet.address],
        queryFn: () => {
            return fetch(
                `${process.env.NEXT_PUBLIC_REDEEM_BASE_URL}/redeems/all?${new URLSearchParams(wallet.authorization ? Object.entries(wallet.authorization) : []).toString()}`
            ).then(res => {
                if (res.ok) {
                    return res.json()
                }
                else {
                    toast.error(`Error loading data (${res.status} ${res.statusText})`)
                    return null;
                }
            })
        },
        enabled: !!wallet.authorization,
    })
	return (
		<div className="max-w-screen-xl container flex flex-col sm:mt-8 mb-4">
			<div className="mx-3 md:mx-8 flex justify-between items-end flex-wrap">
                <h1 className={classNames(nunito.className, 'text-3xl mt-2 mb-4')}>
                    Redeems Dashboard
                </h1>
			</div>
            {paidOrders.data?.redeems?.length ? (
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
                                    Redeem To Address
                                </th>
                                <th scope="col" className="px-6 py-3 text-right">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Redeem TXID
                                </th>
                                <th scope="col" className="px-6 py-3 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paidOrders.data.redeems?.map((data) => {
                                return <TableRow key={data.uuid} data={data} />
                            })}
                        </tbody>
                    </table>
                </div>
            ) : paidOrders.isFetching ? (
                <div className='text-center'>Loading...</div>
            ) : (
                <div className='text-center'>No new deposits.</div>
            )}
		</div>
	)
}

function TableRow({ data }: {
    data: Redeem
}) {
    const wallet = useWallet()
    const [ethTxid, setEthTxid] = useState('')
    const [pendingSaveEthTxid, setPendingEthTxid] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaveResult, setLastSaveResult] = useState<'success' | 'error' | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const handleSave = async () => {
        try {
            setIsSaving(true)
            const result = await fetch(
                `${process.env.NEXT_PUBLIC_REDEEM_BASE_URL}/redeems/update`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...wallet.authorization,
                        uuid: data.uuid,
                        eth_txid: pendingSaveEthTxid,
                    }),
                }
            )
            if (!result.ok) {
                throw new Error("Error saving")
            }
            setEthTxid(pendingSaveEthTxid)
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
        setPendingEthTxid(ethTxid)
        if (ethTxid) {
            setLastSaveResult("success")
        } else {
            setLastSaveResult(null)
        }
    }
    return (
        <tr className="border-b bg-zinc-800 border-zinc-700 font-mono">
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {new Date(data.created_at * 1000).toLocaleString()}
            </td>
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {data.uuid}
            </td>
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {data.btc_txid}
            </td>
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {data.to_eth_account}
            </td>
            <td scope="row" className="px-6 py-4 whitespace-nowrap">
                {data.from_nusd_amount.toLocaleString()}
            </td>
            <td className="px-6 py-4 text-right flex gap-2 items-center">
                <input
                    type="text"
                    value={pendingSaveEthTxid}
                    onChange={(e) => {
                        setPendingEthTxid(e.target.value)
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
                        disabled={isSaving || ethTxid === pendingSaveEthTxid}
                    >
                        Save
                    </Button>
                </div>
            </td>
        </tr> 
    )
}