'use client'

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-children-prop */

import React, { useEffect, useState } from 'react';
import styles from './Mint.module.css';
import { useERC20 } from '../../hooks/useERC20';
import { useAccount, useWriteContract } from 'wagmi';
import { erc20Abi } from 'viem';
import {
  USDE_CONTRACT_ADDRESS_MAINNET,
  USDF_CONTRACT_ADDRESS_SEPOLIA,
} from '../../constants';
import { ConnectKitButton, useModal, useSIWE } from 'connectkit';
import { ArrowIcon } from '../../icons/ArrowIcon';

import { useForm } from '@tanstack/react-form';
import type { FieldApi } from '@tanstack/react-form';

import { toast } from 'react-toastify';
import type { PostDepositRequest, PostDepositResponse } from '../api/deposit/types';
import { Button } from '../../components/ui/button';
import { MintHistory } from './History';
import { unixTimeInSeconds } from '../../utils';
import EthIcon from '@/icons/eth';
import BtcIcon from '@/icons/btc';
import { Nunito } from 'next/font/google'
import NusdIcon from '../../icons/nusd';

const nunito = Nunito({ subsets: ['latin'] })

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { balanceUSDE } = useERC20();
  const siwe = useSIWE();
  const modal = useModal();
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();
  const form = useForm({
    defaultValues: {
      sendAmount: '',
      receiveAmount: '',
      receiveAddress: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        const displayAmount = BigInt(value.sendAmount).toLocaleString();
        if (!account || !account.address || !siwe.isSignedIn) {
          return modal.setOpen(true);
        }

        // Field validator not working for "sendAmount" so validating here instead
        // https://tanstack.com/form/latest/docs/framework/react/guides/validation#validation-at-field-level-vs-at-form-level
        let error = '';
        if (
          !value.sendAmount ||
          (value.sendAmount &&
            (Number(value.sendAmount) < 0 || isNaN(Number(value.sendAmount))))
        ) {
          error = 'Invalid amount';
        } else if (Number(value.sendAmount) > balanceUSDE) {
          error = 'Insufficient balance';
        }
        if (error) {
          return toast.error(error);
        }

        const reqData: PostDepositRequest = {
          from_eth_account: account.address,
          from_usde_amount: (
            Number(value.sendAmount) *
            10 ** USDE_TOKEN_DECIMALS
          ).toString(),
          timestamp: unixTimeInSeconds(),
          to_btc_address: value.receiveAddress,
        };
        const response = await fetch(`/api/deposit` as string, {
          method: 'POST',
          body: JSON.stringify(reqData),
        });
        if (!response.ok) throw new Error('Error requesting deposit');
        const responseData: PostDepositResponse = await response.json();
        if (
          Number(responseData.deposit_usde_total_amount) /
            10 ** USDE_TOKEN_DECIMALS >
          balanceUSDE
        ) {
          return toast.error('Insufficient balance');
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
              toast.error(
                'Error: ' +
                  e.message.slice(0, 150) +
                  '... Check console for details.'
              );
            },
            onSuccess: async () => {
              toast.success(`Minted ${displayAmount} NUSD.`);
              form.reset();
            },
          }
        );
        console.log('txid', txid);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Set input to current balance
  // useEffect(() => {
  //   if (form.getFieldValue('sendAmount') === '' && balanceUSDE) {
  //     form.setFieldValue('sendAmount', () => balanceUSDE.toString(), {
  //       touch: true,
  //     });
  //   }
  // }, [balanceUSDE, form]);

  // Set 1:1 send/receive USDe/NUSD
  const sendAmountField = form.useField({ name: 'sendAmount' });
  useEffect(() => {
    form.setFieldValue('receiveAmount', () =>
      Number(sendAmountField.state.value) > 0
        ? Number(sendAmountField.state.value).toString()
        : ''
    );
  }, [form, sendAmountField.state.value]);

  const requireConnect = !account.isConnected || !siwe.isSignedIn;

  return (
    <div className={styles.exchangeContainer}>
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
                      <img
                        src="/ethena-usde-logo.png"
                        width={24}
                        height={24}
                        alt="USDe icon"
                      />
                      <div className={styles.coinText}>USDe</div>
                      <div className={styles.networkTagWrapper}>
                        <div className={styles.networkTag}>
                          <EthIcon width={20} height={20} />
                        </div>
                      </div>
                    </div>
                    {account.isConnected && (
                      <div className={styles.balanceContainer}>
                        <div className={styles.balance}>
                          Balance: {balanceUSDE.toLocaleString()}
                        </div>
                        {/* <div className={styles.maxButton}>Max</div> */}{' '}
                        {/* TODO */}
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
                      <div className="bg-[#F7931A] p-[0.4rem] rounded-full">
                        <NusdIcon height={14} width={14} className="stroke-primary" />
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

        {/* <div className={styles.fee}>
                    Fee estimate: {fee}
                </div> */}

        <form.Subscribe
          selector={(state) => [state.canSubmit]}
          children={([canSubmit]) => {
            return (
              <div className={`${styles.submitButton} ${nunito.className}`}>
                <Button
                  type={'submit'}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Minting' : 'Mint' }
                </Button>
              </div>
            );
          }}
        />
      </form>
      {account.isConnected && siwe.isSignedIn && <MintHistory />}
    </div>
  );
};

export default Mint;
