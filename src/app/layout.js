import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'
import { tokens } from '@/styles/tokens'
import './globals.css'

// Optimized font loading with next/font
const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex'
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains'
})

// SEO Metadata
export const metadata = {
  title: {
    default: 'Sistema Logístico BMPTY',
    template: '%s | Sistema Logístico BMPTY'
  },
  description: 'Sistema de gestión logística para control de paquetes, facturas, clientes y transferencias entre sucursales',
  keywords: ['logística', 'paquetes', 'facturación', 'gestión', 'BMPTY'],
  authors: [{ name: 'BMPTY' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    title: 'Sistema Logístico BMPTY',
    description: 'Sistema de gestión logística',
    siteName: 'BMPTY Logistics'
  }
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${ibmPlexSans.variable} ${jetbrainsMono.variable}`}
    >
      <body style={{
        margin: 0,
        backgroundColor: tokens.surface.base,
        color: tokens.text.primary,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: tokens.font.family.base
      }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
