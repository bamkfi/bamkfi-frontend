'use client'

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-children-prop */

import React, { useEffect, useState } from 'react';
import styles from '../_styles/swap.module.css';

import { useForm } from '@tanstack/react-form';
import type { FieldApi } from '@tanstack/react-form';

import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import EthIcon from '@/icons/eth';
import BtcIcon from '@/icons/btc';
import NusdIcon from '@/icons/nusd';
import { nunito } from '@/components/ui/fonts';
import UsdeIcon from '@/icons/USDe';
import { Authorization, useWallet } from '@/components/providers/BtcWalletProvider';
import { isAddress } from 'viem';
import { ArrowIcon } from '@/icons/ArrowIcon';
import { useQuery } from '@tanstack/react-query';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const FieldInfo: React.FC<{ field: FieldApi<any, any, any, any> }> = ({
  field,
}) => {
  return (
    <div className={styles.fieldInfo}>
      {field.state.meta.errors.length ? (
        <em>↪ {field.state.meta.errors}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </div>
  );
};

const NUSD_RUNE_NAME = 'NUSDNUSDNUSDNUSD'

const Redeem: React.FC = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wallet = useWallet()
  const nusdRuneBalance = useQuery({
		queryKey: ['nusd-rune-balance', wallet.address],
		queryFn: async () => {
			const response = await fetch(
				`/api/opi/getRunesBalanceByAddress?address=${wallet.address}`
			)
			if (!response.ok) {
        console.error('Error in nusdRuneBalance response:', response.status, response.statusText)
				return null;
			}
			const data = await response.json()
      if (data.error) {
        console.error('Error in nusdRuneBalance response:', data.error)
        return null;
      }
			return data.result.find((rune: any) => rune.rune_name === NUSD_RUNE_NAME)?.total_balance ?? 0;
		},
    enabled: wallet.connected
	})
  // const nusdBrc20Balance = useQuery({
	// 	queryKey: ['nusd-brc20-balance', wallet.address],
	// 	queryFn: async () => {
	// 		const response = await fetch(
	// 			`/api/opi/getBrc20BalanceByAddress?address=${wallet.address}&ticker=$NUSD`
	// 		)
	// 		if (!response.ok) {
  //       console.error('Error in nusdRuneBalance response:', response.status, response.statusText)
	// 			throw new Error("Error in getBrc20BalanceByAddress")
	// 		}
	// 		const data = await response.json()
  //     if (data.error) {
  //       console.error('Error in nusdRuneBalance response:', data.error)
  //       throw new Error("Error in getBrc20BalanceByAddress");
  //     }
	// 		return Number(data.result.overall_balance) / 10 ** 18
	// 	},
	// 	enabled: wallet.connected,
	// })
  const nusdBalance = 0 
    // + (nusdBrc20Balance.data ?? 0) 
    + (nusdRuneBalance.data ?? 0);
  const nusdInputMax = Math.max(
    // nusdBrc20Balance.data ?? 0,
    0,
    nusdRuneBalance.data ?? 0)

  const postRedeem = (body: Authorization & {
    from_nusd_amount: number;
    to_eth_account: string;
  }) => fetch(`${process.env.NEXT_PUBLIC_REDEEM_BASE_URL}/redeems/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })  

  const form = useForm({
    defaultValues: {
      sendAmount: '',
      receiveAmount: '',
      receiveAddress: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        // Field validator not working for "sendAmount" so validating here instead
        // https://tanstack.com/form/latest/docs/framework/react/guides/validation#validation-at-field-level-vs-at-form-level
        if (!wallet.connected || !wallet.authorization) {
          wallet.handleOpen(true);
          return;
        } else if (
          !value.sendAmount ||
          (value.sendAmount &&
            (Number(value.sendAmount) < 0 || isNaN(Number(value.sendAmount))))
        ) {
          throw new Error('Invalid amount');
        } else if (!process.env.NEXT_PUBLIC_MINIMUM_REDEEM_USD || Number(value.sendAmount) < Number(process.env.NEXT_PUBLIC_MINIMUM_REDEEM_USD)) {
          throw new Error(`Minimum redeem is ${Number(process.env.NEXT_PUBLIC_MINIMUM_REDEEM_USD).toLocaleString()} NUSD`)
        }
        const response = await postRedeem({
          ...wallet.authorization,
          from_nusd_amount: Number(value.sendAmount),
          to_eth_account: value.receiveAddress,
        })
        if (!response.ok) {
          if (response.status === 403) {
            wallet.deauthorize()
            wallet.handleOpen(true)
            throw new Error("Authorization expired, please reconnect your wallet")
          }
        }
        const data = await response.json()
        if (data?.error) {
          throw new Error(data.error)
        }
        const { orderId } = data.result
        toast.success("Order created")
        router.push(`/swap/redeem/history/${orderId}`)
      } catch (err: any) {
        toast.error(err.message)
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Set 1:1 send/receive USDe/NUSD
  const sendAmountField = form.useField({ name: 'sendAmount' });
  useEffect(() => {
    form.setFieldValue('receiveAmount', () =>
      Number(sendAmountField.state.value) > 0
        ? Number(sendAmountField.state.value).toString()
        : ''
    );
  }, [form, sendAmountField.state.value]);

  return (
    <div>
      <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className={styles.exchangeBlock}>
            <form.Field
              name="sendAmount"
              validators={
                {
                  // TODO: fix this validator, it is not running
                  //   onChange: ({value}) => {
                  //     if (!value || value && (Number(value) < 0 || isNaN(Number(value)))) {
                  //         return 'Invalid amount'
                  //     }
                  //     console.log('result', 1)
                  //   },
                }
              }
              children={(field) => (
                <>
                  <label htmlFor={field.name} className={styles.label}>
                    You send
                  </label>
                  <div className={styles.inputGroup}>
                    <div className='w-full'>
                      <input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          field.handleChange(value);
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        className={styles.input}
                        placeholder="0"
                        min={0}
                        max={nusdInputMax > 0 ? nusdInputMax : undefined}
                        disabled={isSubmitting}
                      />
                      <FieldInfo field={field} />
                    </div>
                    <div>
                      <div className={styles.currencyContainer}>
                        <div className="bg-[#F7931A] p-[0.4rem] rounded-full h-[24px] w-[24px]">
                          <NusdIcon height={12} width={12} className="stroke-primary" />
                        </div>
                        <div className={styles.coinText}>
                          <div>NUSD</div>
                        </div>
                        <div className={styles.networkTagWrapper}>
                          <div className={styles.networkTag}>
                            <BtcIcon width={20} height={20} />
                          </div>
                        </div>
                      </div>
                      {wallet.connected && !!wallet.authorization && (nusdRuneBalance.data !== null || nusdRuneBalance.isFetching) && (
                        <div className={styles.balanceContainer}>
                          <div className={styles.balance}>
                            Balance: {nusdRuneBalance.data !== null ? Number(nusdBalance).toLocaleString() : nusdRuneBalance.isFetching ? 'Loading' : 0}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            />
          </div>

          <div className={styles.arrow}>
            <ArrowIcon />
          </div>

          <div className={styles.exchangeBlock}>
            <form.Field
              name="receiveAmount"
              children={(field) => (
                <>
                  <label htmlFor={field.name} className={styles.label}>
                    You receive
                  </label>
                  <div className={styles.inputGroup}>
                    <div>
                      <input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="number"
                        className={styles.input}
                        placeholder="0"
                        disabled
                      />
                      <FieldInfo field={field} />
                    </div>
                    <div>
                      <div className={styles.currencyContainer}>
                        <UsdeIcon height={24} width={24} />
                        <div className={styles.coinText}>USDe</div>
                        <div className={styles.networkTagWrapper}>
                          <div className={styles.networkTag}>
                            <div className='bg-[#FAFAFA] rounded-full'>
                              <EthIcon width={20} height={20} className='p-[2px]' />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            />
            <div style={{ marginTop: '0.5rem' }}>
              <form.Field
                name="receiveAddress"
                validators={{
                  onChange: ({ value }) =>
                    !isAddress(value)
                      ? 'Invalid address'
                      : undefined,
                }}
                children={(field) => (
                  <>
                    <label htmlFor={field.name} className={styles.label}>
                      To address
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      className={styles.input}
                      placeholder="0x..."
                      disabled={isSubmitting}
                    />
                    <FieldInfo field={field} />
                  </>
                )}
              />
            </div>
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit]}
            children={([canSubmit]) => {
              return (
                <div className={`${styles.submitButton} ${nunito.className}`}>
                  <Button
                    type={'submit'}
                    disabled={isSubmitting}
                    variant={"default"}
                  >
                    Redeem
                  </Button>
                </div>
              );
            }}
          />
        </form>
        {wallet.connected && wallet.authorization && (
          <Link href="/swap/redeem/history">
            <div className={`${nunito.className} text-gray-400 text-center m-3`}>
              <Button
                type={'submit'}
                disabled={isSubmitting}
                variant={"ghost"}
                className='hover:bg-transparent'
              >
                <div className='flex items-center opacity-75'>
                  History
                  <ChevronRightIcon />
                </div>
              </Button>
            </div>
          </Link>
        )}
    </div>
  )
}

export default Redeem;
