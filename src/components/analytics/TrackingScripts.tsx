'use client'

import Script from 'next/script'

// IDs migrados del WP parkerandlenox.com
const GTM_ID = 'GTM-KSCRHM32'
const FB_PIXEL_ID = '2190510944792875'
const METRICOOL_HASH = 'd3b63cf25fd42d2d0113ea4ee754c52d'

export function TrackingScripts() {
  return (
    <>
      {/* ── Google Tag Manager ─────────────────────────────── */}
      <Script id="gtm-base" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>

      {/* ── Facebook / Meta Pixel ──────────────────────────── */}
      <Script id="fb-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${FB_PIXEL_ID}');`}
      </Script>

      {/* ── Metricool ──────────────────────────────────────── */}
      <Script id="metricool" strategy="afterInteractive"
        src="https://tracker.metricool.com/resources/be.js"
        onLoad={() => {
          // @ts-expect-error beTracker se define al cargar el script remoto
          if (typeof beTracker !== 'undefined') beTracker.t({ hash: METRICOOL_HASH })
        }}
      />
    </>
  )
}

// ── Fallback <noscript> — va inmediatamente después de <body> ──
export function TrackingNoscript() {
  return (
    <>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0" width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      <noscript>
        <img
          height="1" width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
