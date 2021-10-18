import Head from 'next/head';
import '../styles/normalize.css';
import '../styles/main.css';
import '../styles/deckeditor.css';
import '../styles/faqs.css';
import '../styles/credits.css';
import '../styles/roboto.css';
import { boot } from '../services/boot.service';
import { React } from 'react';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => { 
    boot();
  }, []);
  return (
    <>
      <Head>
        <meta charset="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <title>YGOSalvation Server - Online Dueling</title>
        <meta name="description" content="Web based YGOPro System." />

        <meta itemProp="name" content="YGOSalvation Server - Online Dueling" />
        <meta itemProp="description" content="" />
        <meta name="viewport" content="width=device-width" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet" />
        <script src="./vendor/primus.js"></script>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
