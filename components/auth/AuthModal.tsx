"use client";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useEffect, useState } from "react";
import useAuthModal from "@/hooks/useAuthModal";
import { Modal } from "../ui"

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
                    console.log('Initializing user:', session.user.id);
                    
                    // Check if user already has a DID and username
                    const { data: existingUser, error: fetchError } = await supabaseClient
                        .from('users')
                        .select('hedera_did, username')
                        .eq('id', session.user.id)
                        .single();

                    if (fetchError && fetchError.code !== 'PGRST116') {
                        console.error('Error checking user:', fetchError);
                    }

                    // Only initialize if user doesn't have DID or username
                    if (!existingUser?.hedera_did || !existingUser?.username) {
                        // Initialize user (set username)
                        const initResponse = await fetch('/api/user/init', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ userId: session.user.id }),
                        });

                        if (!initResponse.ok) {
                            throw new Error('Failed to initialize user');
                        }

                        // Create DID (separate call)
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
                            console.warn('DID creation failed:', await didResponse.text());
                        } else {
                            const didData = await didResponse.json();
                            if (didData.alreadyExists) {
                                console.log('DID already existed for user:', session.user.id);
                            } else {
                                console.log('DID created successfully for user:', session.user.id);
                            }
                        }
                    } else {
                        console.log('User already has DID and username:', session.user.id);
                    }

                    // Mark this user as initialized
                    setInitializedUsers(prev => new Set(prev).add(session.user.id));
                    
                } catch (error) {
                    console.error('Error in user initialization:', error);
                } finally {
                    setIsInitializing(false);
                }
            }
        };

        initializeUser();
    }, [session, isInitializing, initializedUsers, supabaseClient]);

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