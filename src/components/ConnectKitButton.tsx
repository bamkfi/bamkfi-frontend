'use client'

import { ConnectKitButton, useSIWE } from "connectkit";
import { Button } from "./ui/button";
import { shortenAddress } from "@/utils";

export const CustomConnectKitButton = () => {
  const siwe = useSIWE();
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        return (
          <Button onClick={show} variant={isConnected ? 'ghost' : 'default'}>
            <div className="flex gap-2 items-center">
              {(isConnected && !siwe.isSignedIn) && (
                <div className="relative">
                  <div className="absolute top-[-2px] right-[-2px] z-2 bg-[#1a88f8] rounded-md shadow-[0_0_0_2px] shadow-[var(--ck-body-background)] w-2 h-2"></div>
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="overflow-visible"
                  >
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"></circle>
                    <path
                      d="M16.5 16.775C14.8618 15.0649 12.5552 14 10 14C7.44477 14 5.13825 15.0649 3.5 16.775"
                      stroke="currentColor"
                      strokeWidth="2"
                    ></path>
                    <circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="2"></circle>
                  </svg>
                </div>
              )}
              {(isConnected && siwe.isSignedIn) && (
                <div className="relative">
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
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="overflow-visible"
                  >
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"></circle>
                    <path
                      d="M16.5 16.775C14.8618 15.0649 12.5552 14 10 14C7.44477 14 5.13825 15.0649 3.5 16.775"
                      stroke="currentColor"
                      strokeWidth="2"
                    ></path>
                    <circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="2"></circle>
                  </svg>
                </div>
              )}
              {(isConnected && address) ? shortenAddress(address) : "Connect Wallet"}
            </div>
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};