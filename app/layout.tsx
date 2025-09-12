import { Figtree } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/LeftSidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import SupabaseProvider from '@/providers/SupabaseProvider'
import UserProvider from '@/providers/UserProvider'
import ModalProvider from '@/providers/ModalProvider'
import ToasterProvider from '@/providers/ToasterProvider'
import getSongsByUserId from '@/actions/getSongsByUserId'
import Player from '@/components/layout/Player'
import Header from '@/components/layout/Header'

const font = Figtree({ subsets: ['latin'] })

export const metadata = {
  title: 'Shamana',
  description: 'Listen to Music',
}

export const revalidate = 0;

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const userSongs = await getSongsByUserId();

    return (
        <html lang="en">
            <body className={font.className}>
                <ToasterProvider />
                <SupabaseProvider>
                    <UserProvider>
                        <ModalProvider />
                        <div className="grid grid-cols-[auto,1fr,auto] grid-rows-[auto,1fr,auto] h-screen bg-black">
                            {/* Left Sidebar */}
                            {/* <div className="col-start-1 row-span-2">
                                <Sidebar songs={userSongs} />
                            </div> */}
                            
                            {/* Header */}
                            <header className="col-start-2 row-start-1 z-10">
                                <Header />
                            </header>
                            
                            {/* Main Content */}
                            <main className="col-start-2 row-start-2 overflow-y-auto bg-gradient-to-b from-neutral-900 to-black">
                                {children}
                            </main>
                            
                            {/* Right Sidebar */}
                            {/* <div className="col-start-3 row-span-2">
                                <RightSidebar />
                            </div> */}
                            
                            {/* Player Footer */}
                            <footer className="col-span-3 row-start-3">
                                <Player />
                            </footer>
                        </div>
                    </UserProvider>
                </SupabaseProvider>
            </body>
        </html>
    )
}
