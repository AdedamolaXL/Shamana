// components/authModal.tsx
"use client";

import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useEffect, useState } from "react";
import { generateHederaKeys, encryptPrivateKey } from '@/lib/hedera-keys'
import useAuthModal from "@/hooks/useAuthModal";
import Modal from "./Modal";

const AuthModal = () => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { session } = useSessionContext();
    const { onClose, isOpen } = useAuthModal();
    const [isCreatingUser, setIsCreatingUser] = useState(false);

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
        const createUserRecord = async () => {
            if (session && session.user && session.user.id && !isCreatingUser) {
                setIsCreatingUser(true);
                try {
                    console.log('Creating user record for:', session.user.id);
                    
                    // Generate Hedera keys
                    const { privateKey, publicKey, evmAddress } = generateHederaKeys();
                    const encryptedPrivateKey = encryptPrivateKey(privateKey);

                    // Use upsert to either insert or update the user record
                    const { error } = await supabaseClient
                        .from('users')
                        .upsert({
                            id: session.user.id,
                            hedera_public_key: publicKey.toStringDer(),
                            hedera_private_key_encrypted: encryptedPrivateKey,
                            hedera_evm_address: evmAddress
                        }, {
                            onConflict: 'id'
                        });

                    if (error) {
                        console.error('Failed to create/update user record:', error);
                    } else {
                        console.log('User record created/updated successfully');
                    }
                } catch (error) {
                    console.error('Error in user creation process:', error);
                } finally {
                    setIsCreatingUser(false);
                }
            }
        };

        createUserRecord();
    }, [session, supabaseClient, isCreatingUser]);

    return (
        <Modal title="Welcome to my project" description="Dont want to enter your info? dont worry, use krinsproject@gmail.com and aaaaaaaa" isOpen={isOpen} onChange={onChange}>
            <Auth theme="dark" magicLink providers={["github"]} supabaseClient={supabaseClient}  appearance={{
                theme: ThemeSupa,
                variables: {
                    default: {
                        colors: {
                            brand: "#404040",
                            brandAccent: "#22c55e"
                        }
                    }
                }
            }}/> 
        </Modal>
    );
}
 
export default AuthModal;