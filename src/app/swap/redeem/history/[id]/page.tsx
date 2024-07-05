'use client'

import {RedeemHistory} from '@/app/swap/redeem/history/RedeemHistory';
import { usePathname } from 'next/navigation';
import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Navigation from "@/components/navigation";
import { CaretLeftIcon } from "@radix-ui/react-icons";

const Nav = () => 
  <nav className="relative flex items-center justify-center mb-2 h-12">
    <div className="absolute left-0">
      <Link href="/swap/redeem/history">
        <Button aria-label="Back" variant="ghost">
          <div className="flex items-center gap-1 opacity-60">
            <CaretLeftIcon/>
            <div>History</div>
          </div>
        </Button>
      </Link>
    </div>
    <div className="absolute left-1/2 transform -translate-x-1/2">
      <Navigation links={[{ href: "/swap/redeem/history", name: 'Order Status'}]} />
    </div>
  </nav>

const RedeemOrderStatusPage = () => {
  const pathname = usePathname();
  const orderId = pathname?.split('/').pop();
  if (!orderId) return null;
  return (
    <>
      <RedeemHistory orderId={orderId} nav={<Nav />} />
    </>
  )
};

export default RedeemOrderStatusPage;
