'use client'

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-children-prop */

import React, { useEffect, useState } from 'react';
import styles from '../_styles/swap.module.css';
import { useERC20 } from '../../../hooks/useERC20';
import { useAccount, useWriteContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { useModal, useSIWE } from 'connectkit';
import { ArrowIcon } from '../../../icons/ArrowIcon';

import { useForm } from '@tanstack/react-form';
import type { FieldApi } from '@tanstack/react-form';

import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import EthIcon from '@/icons/eth';
import BtcIcon from '@/icons/btc';
import NusdIcon from '@/icons/nusd';
import { USDE_CONTRACT_ADDRESS_MAINNET, USDF_CONTRACT_ADDRESS_SEPOLIA } from '@/lib/constants';
import { nunito } from '@/components/ui/fonts';
import UsdeIcon from '@/icons/USDe';
import { ChevronRightIcon } from "@radix-ui/react-icons";
import Link from 'next/link';


const USDE_TOKEN_DECIMALS = 18;

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

const Mint: React.FC = () => {
  const { balanceUSDE } = useERC20();
  const siwe = useSIWE();
  const modal = useModal();
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    defaultValues: {
      sendAmount: '',
      receiveAmount: '',
      receiveAddress: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        if (!account.isConnected) return modal.setOpen(true);
        if (!siwe.isSignedIn) return modal.openSIWE();

        // Field validator not working for "sendAmount" so validating here instead
        // https://tanstack.com/form/latest/docs/framework/react/guides/validation#validation-at-field-level-vs-at-form-level
        if (
          !value.sendAmount ||
          (value.sendAmount &&
            (Number(value.sendAmount) < 0 || isNaN(Number(value.sendAmount))))
        ) {
          throw new Error('Invalid amount');
        } else if (Number(value.sendAmount) > balanceUSDE) {
          throw new Error('Insufficient balance');
        } else if (!process.env.NEXT_PUBLIC_MINIMUM_DEPOSIT_USD || Number(value.sendAmount) < Number(process.env.NEXT_PUBLIC_MINIMUM_DEPOSIT_USD)) {
          throw new Error("Minimum mint is 10,000 NUSD")
        }

        const reqData = {
          from_eth_account: account.address,
          from_usde_amount: (
            Number(value.sendAmount) *
            10 ** USDE_TOKEN_DECIMALS
          ),
          to_btc_address: value.receiveAddress,
        };
        const response = await fetch(`/api/autoswap/deposits` as string, {
          method: 'POST',
          body: JSON.stringify(reqData),
        });
        if (!response.ok) throw new Error('Server error');
        const responseData = await response.json();
        if (
          Number(responseData.deposit_usde_total_amount) /
            10 ** USDE_TOKEN_DECIMALS >
          balanceUSDE
        ) {
          throw new Error("Insufficient balance")
        }
        const txid = await writeContractAsync(
          {
            chainId: account.chainId,
            abi: erc20Abi,
            address:
              account.chain?.id === 1
                ? USDE_CONTRACT_ADDRESS_MAINNET
                : USDF_CONTRACT_ADDRESS_SEPOLIA,
            functionName: 'transfer',
            args: [
              responseData.deposit_usde_account as `0x${string}`,
              BigInt(responseData.deposit_usde_total_amount),
            ],
          },
          {
            onSettled: async () => {},
            onError: async (e: any) => {
              console.error(e);
              // toast.error(e.message);
            },
            onSuccess: async () => {
              const displayAmount = BigInt(value.sendAmount).toLocaleString();
              toast.success(`Successfully ordered ${displayAmount} NUSD`);
              form.reset();
            },
          }
        );
        console.log('txid', txid);
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
                    <div>
                      <input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="number"
                        className={styles.input}
                        placeholder="0.00"
                        min={1 / 10 ** USDE_TOKEN_DECIMALS}
                        max={balanceUSDE > 0 ? balanceUSDE : undefined}
                        disabled={isSubmitting}
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
                      {account.isConnected && (
                        <div className={styles.balanceContainer}>
                          <div className={styles.balance}>
                            Balance: {balanceUSDE.toLocaleString()}
                          </div>
                          {/* <div className={styles.maxButton}>Max</div> */}
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
                      <input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="number"
                        className={styles.input}
                        placeholder="0.00"
                        disabled
                      />
                      <FieldInfo field={field} />
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
                    !value.trim() || value.trim().length < 26
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
                      placeholder="bc1p..."
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
                    {isSubmitting ? 'Minting' : 'Mint' }
                  </Button>
                </div>
              );
            }}
          />
        </form>
        {account.isConnected && siwe.isSignedIn && (
          <Link href="/swap/mint/history">
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

export default Mint;
