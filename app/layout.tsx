import { Work_Sans } from 'next/font/google'
import type { Metadata } from 'next'
import '@/app/globals.css'
import ToasterProvider from '@/providers/ToasterProvider'
import SupabaseProvider from '@/providers/SupabaseProvider'
import UserProvider from '@/providers/UserProvider'
import ModalProvider from '@/providers/ModalProvider'
import Header from '@/components/layout/Header'
import Player from '@/components/layout/Player'


const workSans = Work_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-work-sans'
})

export const metadata: Metadata = {
  title: 'Shamana - Music Streaming Platform',
  description: 'Discover, create, and share music with a global community',
}

export const revalidate = 0;

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <html lang="en" className={workSans.variable}>
        <head>
            {/* Preload critical resources */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />    
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </head>
            <body>
                <ToasterProvider />
                <SupabaseProvider>
                    <UserProvider>
                        <ModalProvider />
                        <div className="">
                            <Header />
                            <main className="max-w-[1200px] mx-auto px-[20px]">
                                {children}
                            </main>
                            <Player />
                        </div>
                    </UserProvider>
                </SupabaseProvider>
            </body>
        </html>
    )
}
