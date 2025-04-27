import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import logger from '@/services/logger';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="contact" content="info@speedy-van.co.uk" />
        <Script
          id="mapbox-gl-js"
          strategy="beforeInteractive"
          src="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.js"
          onLoad={() => logger.info('✅ Mapbox GL JS loaded successfully')}
          onError={() => logger.error('❌ Failed to load Mapbox GL JS')}
        />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
