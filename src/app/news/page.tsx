'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';

declare global {
  interface Window {
    twttr: any;
  }
}

const tweetUrls = [
    "https://twitter.com/bamkfi/status/1802828568021668044?ref_src=twsrc%5Etfw", //Jun 18 Nakamoto Dollar, NUSD, is a synthetic dollar native to Bitcoin
    "https://twitter.com/bamkfi/status/1802302547815751839?ref_src=twsrc%5Etfw", //Jun 16 Chart of NUSD Reserves 
    "https://twitter.com/bamkfi/status/1780549067518431410?ref_src=twsrc%5Etfw", //Apr 17 running NUSD
];

export default function News() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.twttr) {
        window.twttr.widgets.load();
      }
    };
  }, []);

  const renderTweet = (url: string) => (
    <blockquote
      key={url}
      className="twitter-tweet"
      data-theme="dark"
      data-conversation="none"
      data-dnt="true"
      data-align="center"
      data-width="500"
      data-border="#ff0000"
    >
      <a href={url}></a>
    </blockquote>
  );

  return (
    <div className="container mx-auto p-4">
      <Head>
        <meta name="twitter:widgets:theme" content="dark" />
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </Head>
      <div className="flex flex-col gap-4">
        {isClient && tweetUrls.map(url => renderTweet(url))}
      </div>
    </div>
  );
}
