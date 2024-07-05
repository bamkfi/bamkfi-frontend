/* eslint-disable @next/next/no-img-element */
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/utils";
import BtcIcon from '@/icons/btc';
import { OvalSpinner } from '../Loaders';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { toast } from 'react-toastify';

export interface Authorization {
  from_btc_address: string;
  from_btc_public_key: string;
  signature: string;
}

interface WalletAdapter {
  id: 'okx' | 'unisat' // | 'xverse'
  name: string;
  icon: string;
  connect: () => Promise<undefined>;
  disconnect: () => Promise<undefined>;
  signMessage: (message: string) => Promise<string>;
  detected: boolean;
}

export interface WalletContextType {
  initialized: boolean;
  connected: boolean;
  connecting: WalletAdapter['id'] | undefined;
  adapters: WalletAdapter[];
  adapter: WalletAdapter | undefined;
  selectedAdapter: WalletAdapter['id'] | undefined;
  address: string;
  publicKey: string;
  open: boolean;
  handleOpen: (open: boolean) => unknown;
  authorization: Authorization | undefined;
  authorize: () => Promise<WalletContextType['authorization'] | void>
  deauthorize: () => unknown
  authorizing: boolean;
}

export function unsignedAuthMessage(address: string) {
    return `Sign to verify ownership of Bitcoin address ${address}`
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const BtcWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [initialized, setInitialized] = useState<WalletContextType['initialized']>(false)
  const [adapters, setAdapters] = useState<WalletContextType['adapters']>([])
  const [selectedAdapter, setSelectedAdapter] = useState<WalletAdapter['id']>()
  const [connecting, setConnecting] = useState<WalletAdapter['id']>()
  const [address, setAddress] = useState("")
  const [publicKey, setPublicKey] = useState("")
  const [open, setOpen] = useState(false)
  const [authorization, setAuthorization] = useState<WalletContextType['authorization']>()
  const [authorizing, setAuthorizing] = useState(false)

  const handleOpen = (value: boolean) => {
    setOpen(prev => value !== undefined ? value : !prev)
    setConnecting(undefined)
    setAuthorizing(false)
  }

  async function authorize(): Promise<WalletContextType['authorization'] | undefined> {
    try {
      setAuthorizing(true)
      if (authorization) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_REDEEM_BASE_URL}/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(authorization)
        });
        if (response.ok) {
          return
        }
      }
      setAuthorization(undefined)
      const adapter = adapters.find(a => a.id === selectedAdapter)
      if (!adapter) throw new Error("Cannot auth without wallet adapter");
      const unsignedMessage = unsignedAuthMessage(address);
      const signedMessage = await adapter.signMessage(unsignedMessage)
      const newAuthorization: WalletContextType['authorization'] = {
        from_btc_address: address,
        from_btc_public_key: publicKey,
        signature: signedMessage
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_REDEEM_BASE_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAuthorization)
      });
      if (!response.ok) {
        throw new Error("Unauthorized")
      }
      setAuthorization(newAuthorization)
      return newAuthorization
    } catch (e) {
      console.error(e)
      toast.error("Unauthorized")
      setOpen(true)
    } finally {
      setAuthorizing(false)
    }
  }

  useEffect(() => {
    function loadAdapters() {
      const adapters:  WalletAdapter[] = []
      const disconnect = () => {
        setAddress("")
        setPublicKey("")
        setAuthorization(undefined)
        setSelectedAdapter(undefined)
      }

      // let xverseAdapter: WalletAdapter 
      // const satsConnectProviders = getProviders()
      // const xverseProvider = satsConnectProviders.find(p => p.id === 'XverseProviders.BitcoinProvider')
      // const xverse = xverseProvider ? window.XverseProviders?.BitcoinProvider : undefined;
      // if (xverse) {
      //     xverseAdapter = {
      //       id: 'xverse',
      //       connect: async () => {
      //         setConnecting('xverse')
      //         try {
      //           setDefaultProvider('XverseProviders.BitcoinProvider')
      //           const response = await Wallet.request('getAccounts', { purposes: [AddressPurpose.Ordinals]});
      //           if (response.status === 'success') {
      //             console.log('response', response)
      //             const data = response.result[0]
      //             setAddress(data.address)
      //             setPublicKey(data.publicKey)
      //             setSelectedAdapter('xverse')
      //           } else {
      //             throw new Error("Error connecting to Xverse Wallet")
      //           }
      //         } catch (err) {
      //         } finally {
      //           setConnecting(undefined)
      //         }
      //       },
      //       icon: xverseProvider?.icon as string,
      //       name: xverseProvider?.name as string,
      //       detected: true,
      //       disconnect: async () => {
      //         Wallet.disconnect()
      //         disconnect()
      //       },
      //       signMessage: async (message: string) => {
      //         // const response = await Wallet.request('signMessage', { address: address, message });
      //         const response = await window.XverseProviders?.BitcoinProvider?.signMessage(message)
      //         console.log('response', response)
      //         return ""
      //         // if (response.status === "success") {
      //         //   return response.data
      //         // } else {
      //         //   if (response.error.code === RpcErrorCode.USER_REJECTION) {
      //         //      throw new Error("err")
      //         //     } else {
      //         //       throw new Error("err")
      //         //   }
      //       }
      //     }
      // } else {
      //   xverseAdapter = {
      //     id: 'xverse',
      //     name: "Xverse Wallet",
      //     icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxNzE3MTciIGQ9Ik0wIDBoNjAwdjYwMEgweiIvPjxwYXRoIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTQ0MCA0MzUuNHYtNTFjMC0yLS44LTMuOS0yLjItNS4zTDIyMCAxNjIuMmE3LjYgNy42IDAgMCAwLTUuNC0yLjJoLTUxLjFjLTIuNSAwLTQuNiAyLTQuNiA0LjZ2NDcuM2MwIDIgLjggNCAyLjIgNS40bDc4LjIgNzcuOGE0LjYgNC42IDAgMCAxIDAgNi41bC03OSA3OC43Yy0xIC45LTEuNCAyLTEuNCAzLjJ2NTJjMCAyLjQgMiA0LjUgNC42IDQuNUgyNDljMi42IDAgNC42LTIgNC42LTQuNlY0MDVjMC0xLjIuNS0yLjQgMS40LTMuM2w0Mi40LTQyLjJhNC42IDQuNiAwIDAgMSA2LjQgMGw3OC43IDc4LjRhNy42IDcuNiAwIDAgMCA1LjQgMi4yaDQ3LjVjMi41IDAgNC42LTIgNC42LTQuNloiLz48cGF0aCBmaWxsPSIjRUU3QTMwIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGQ9Ik0zMjUuNiAyMjcuMmg0Mi44YzIuNiAwIDQuNiAyLjEgNC42IDQuNnY0Mi42YzAgNCA1IDYuMSA4IDMuMmw1OC43LTU4LjVjLjgtLjggMS4zLTIgMS4zLTMuMnYtNTEuMmMwLTIuNi0yLTQuNi00LjYtNC42TDM4NCAxNjBjLTEuMiAwLTIuNC41LTMuMyAxLjNsLTU4LjQgNTguMWE0LjYgNC42IDAgMCAwIDMuMiA3LjhaIi8+PC9nPjwvc3ZnPg==",
      //     detected: false,
      //     connect: () => Promise.reject(),
      //     disconnect: () => Promise.reject(),
      //     signMessage: () => Promise.reject(),
      //   }
      // }
      // adapters.push(xverseAdapter)

      let okxAdapter: WalletAdapter 
      if (typeof window.okxwallet !== 'undefined') {
        const okxProvider = window.okxwallet.bitcoin;
          okxAdapter = {
            id: 'okx',
            connect: async () => {
              setConnecting('okx')
              try {
                const result = await okxProvider.connect()
                console.log('result', result)
                const publicKey = await okxProvider.getPublicKey()
                setAddress(result.address)
                setPublicKey(publicKey)
                setSelectedAdapter('okx')
              } catch (err) {
              } finally {
                setConnecting(undefined)
              }
            },
            icon: '/logos/okx2.png',
            name: 'OKX Wallet',
            detected: true,
            disconnect: async () => {
              disconnect()
            },
            signMessage:  (message: string) => okxProvider.signMessage(message)
          }
      } else {
        okxAdapter = {
          id: 'okx',
          name: "OKX Wallet",
          icon: '/logos/okx2.png',
          detected: false,
          connect: async () => { window.open("https://www.okx.com/download", "_blank") },
          disconnect: () => Promise.reject(),
          signMessage: () => Promise.reject(),
        }
      }
      adapters.push(okxAdapter)
      
      let unisatAdapter: WalletAdapter 
      if (typeof window.unisat !== 'undefined') {
        const unisatProvider = window.unisat;
        unisatAdapter = {
            id: 'unisat',
            connect: async () => {
              setConnecting('unisat')
              try {
                const accounts = await unisatProvider.requestAccounts()
                const publicKey = await unisatProvider.getPublicKey();
                setAddress(accounts[0])
                setPublicKey(publicKey)
                setSelectedAdapter('unisat')
              } catch (err) {
              } finally {
                setConnecting(undefined)
              }
            },
            icon: '/logos/unisat-icon.png',
            name: 'UniSat Wallet',
            detected: true,
            disconnect: async () => {
              disconnect()
            },
            signMessage:  (message: string) => unisatProvider.signMessage(message)
          }
      } else {
        unisatAdapter = {
          id: 'unisat',
          name: "UniSat Wallet",
          icon: '/logos/unisat-icon.png',
          detected: false,
          connect: async () => { window.open("https://unisat.io/download", "_blank")},
          disconnect: () => Promise.reject(),
          signMessage: () => Promise.reject(),
        }
      }
      adapters.push(unisatAdapter)

      setAdapters(adapters)
    }
    loadAdapters()
    setInitialized(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <WalletContext.Provider value={{
      initialized,
      adapters,
      adapter: adapters.find(a => a.id === selectedAdapter),
      selectedAdapter,
      connected: !!address,
      connecting,
      address,
      publicKey,
      open,
      handleOpen,
      authorization,
      authorize,
      authorizing,
      deauthorize: () => { setAuthorization(undefined) }
    }}>
      {children}
    </WalletContext.Provider>
  )
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

const ConnectedBitcoinIcon = () => {
  return (
    <div className="absolute bottom-[-1px] right-[-1px] z-2 flex items-center justify-center bg-green-500 rounded-full shadow-[0_0_0_1.5px] shadow-[var(--background)] w-2.5 h-2.5">
      <svg
          aria-hidden="true"
          width="6"
          height="6"
          viewBox="0 0 6 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
      >
          <path
          d="M0.75 3L2.25 4.5L5.25 1.5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          ></path>
      </svg>
    </div>
  )
}

export const ConnectBtcButton = () => {
  const wallet = useWallet();
  const { connected, connecting, initialized, address, authorization } = wallet;
  return (
    <>
        <Button variant={connected ? 'ghost' : 'outline'} disabled={!initialized || !!connecting}>
        <div className="flex gap-2 items-center">
            <BitcoinIconWithStatus />
            {address && authorization ? shortenAddress(address) : "Connect Wallet"}
        </div>
        </Button>
    </>
  );
};

const BitcoinIconWithStatus = () => {
  const wallet = useWallet();
  return (
    <div className="relative">
      {wallet.connected && wallet.authorization && <ConnectedBitcoinIcon />}
      <BtcIcon height={20} width={20} />
    </div>
  )
}

export const ConnectBtcModal = () => {
  const wallet = useWallet();
  return (
    <Dialog open={wallet.open} onOpenChange={wallet.handleOpen}>
      <DialogTrigger>
        <ConnectBtcButton />
      </DialogTrigger>
      <DialogContent className='w-[360px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 justify-center cursor-default mb-2'>
            <BitcoinIconWithStatus />
            {wallet.connected && wallet.authorization ? "Connected" : "Connect Wallet"}
          </DialogTitle>
          <DialogDescription className='flex flex-col items-center justify-center gap-2'>
            {wallet.connected && (
              <div className='break-words overflow-auto text-center w-auto font-mono'>
                <span>
                  {shortenAddress(wallet.address)}
                </span>
                      <img
                        src={wallet.adapter?.icon}
                        width={24}
                        height={24}
                        className="object-contain h-auto inline-block ml-2"
                        style={{ filter: wallet.adapter?.name === 'OKX Wallet' ? 'invert(100%) brightness(2)' : ''}}
                        alt={wallet.adapter?.name}
                      />
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
            {!wallet.connected ? (wallet.adapters.map((a) => {
                const adapterConnecting = wallet.connecting === a.id
                return (
                  <Button 
                    key={a.name}
                    onClick={a.connect}
                    variant="outline" 
                    className='w-full bg-stone-800 hover:bg-stone-700 h-auto focus:border-transparent'
                    disabled={!!wallet.connecting}
                  >
                    <div className='w-full flex items-center justify-between text-lg p-1 relative'>
                      {a.name}
                      <div className='flex items-center justify-center gap-2'>
                        {adapterConnecting && (
                            <OvalSpinner color="white"/>
                        )}
                        <img
                          src={a.icon}
                          width={32}
                          height={32}
                          className="object-contain h-auto"
                          style={{ filter: a.name === 'OKX Wallet' ? 'invert(100%) brightness(2)' : ''}}
                          alt={a.name}
                        />
                      </div>
                    </div>
                  </Button>
                )
              })) : (
                <div className='w-full flex flex-col gap-2'>
                  {!wallet.authorization ? (
                    <Button onClick={wallet.authorize} variant="default" disabled={wallet.authorizing} className='flex items-center gap-1 relative'>
                          Connect
                          <ArrowRightIcon />
                          {wallet.authorizing &&
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <OvalSpinner color="white"/>
                            </div>
                          }
                    </Button>
                  ) : (
                    <Button onClick={() => wallet.handleOpen(false)} variant="default" className='flex items-center gap-1'>
                      OK
                    </Button>
                  )}
                  <Button onClick={wallet.adapter?.disconnect} variant="outline">
                    {wallet.authorization ? 'Disconnect' : 'Cancel'}
                  </Button>
                </div>
              )}
      </DialogContent>
    </Dialog>
  )
}