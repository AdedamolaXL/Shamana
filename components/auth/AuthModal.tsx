"use client";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useEffect, useState } from "react";
import useAuthModal from "@/hooks/useAuthModal";
import { Modal } from "../ui"
import toast from "react-hot-toast";

const AuthModal = () => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { session } = useSessionContext();
    const { onClose, isOpen } = useAuthModal();
    const [isInitializing, setIsInitializing] = useState(false);
    const [initializedUsers, setInitializedUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (session) {
            router.refresh();
            onClose();
        }
    }, [session, router, onClose])

    const onChange = (open: boolean) => {
        if (!open) onClose()
    }

    useEffect(() => {
        const initializeUser = async () => {
            if (session && session.user && session.user.id && !isInitializing) {
                // Check if we've already initialized this user
                if (initializedUsers.has(session.user.id)) {
                    console.log('User already initialized:', session.user.id);
                    return;
                }

                setIsInitializing(true);
                try {
                    console.log('Starting user initialization for:', session.user.id);
                    
                    // Step 1: Initialize user with username
                    console.log('Step 1: Setting username...');
                    const initResponse = await fetch('/api/user/init', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: session.user.id }),
                    });

                    if (!initResponse.ok) {
                        const errorText = await initResponse.text();
                        throw new Error(`Failed to initialize user: ${errorText}`);
                    }
                    console.log('✅ Username set successfully');

                    // Step 2: Activate Hedera account with 50 HBAR
                    console.log('Step 2: Activating Hedera account...');
                    const walletResponse = await fetch('/api/wallet/activate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ amount: 50 }), // Increased to 50 HBAR
                    });

                    if (!walletResponse.ok) {
                        const errorText = await walletResponse.text();
                        console.warn('Wallet activation warning:', errorText);
                        // Continue with DID creation even if wallet activation has issues
                    } else {
                        console.log('✅ Hedera account activated successfully');
                    }

                    // Step 3: Create DID (wait a bit to ensure account is ready)
                    console.log('Step 3: Creating DID...');
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                    
                    const didResponse = await fetch('/api/did/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            userId: session.user.id, 
                            userEmail: session.user.email || '' 
                        }),
                    });

                    if (!didResponse.ok) {
                        const errorText = await didResponse.text();
                        console.warn('DID creation warning:', errorText);
                        // Don't throw error - user can still use the app without DID
                    } else {
                        const didData = await didResponse.json();
                        if (didData.alreadyExists) {
                            console.log('DID already existed for user:', session.user.id);
                        } else {
                            console.log('✅ DID created successfully for user:', session.user.id);
                        }
                    }

                    // Mark this user as initialized
                    setInitializedUsers(prev => new Set(prev).add(session.user.id));
                    console.log('✅ User initialization completed successfully');
                    
                } catch (error) {
                    console.error('Error in user initialization:', error);
                    toast.error('Failed to complete user setup. Some features may not work.');
                } finally {
                    setIsInitializing(false);
                }
            }
        };

        initializeUser();
    }, [session, isInitializing, initializedUsers]);

    useEffect(() => {
        return () => {
            // Clear initialized users when component unmounts
            setInitializedUsers(new Set());
        };
    }, []);

    return (
        <Modal 
            title="Welcome to Shamana" 
            description="Sign in to your account to continue" 
            isOpen={isOpen} 
            onChange={onChange}
        >
            <Auth 
                theme="dark" 
                magicLink 
                providers={["google"]} 
                supabaseClient={supabaseClient}  
                appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                brand: "#404040",
                                brandAccent: "#22c55e"
                            }
                        }
                    }
                }}
            /> 
        </Modal>
    );
}
 
export default AuthModal;