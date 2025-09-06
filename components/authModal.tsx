"use client";

import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { useEffect, useState } from "react";
import { generateHederaKeys, encryptPrivateKey } from '@/lib/hedera-keys'
import useAuthModal from "@/hooks/useAuthModal";
import Modal from "./Modal";
import { useHederaDid } from '@/hooks/useHederaDID';

const AuthModal = () => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { session } = useSessionContext();
    const { onClose, isOpen } = useAuthModal();
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const { createUserDid } = useHederaDid();


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
        
        // Create DID via API
        await createUserDid(session.user.id, session.user.email || '');
        
        console.log('User DID created successfully');
      } catch (error) {
        console.error('Error in user creation process:', error);
      } finally {
        setIsCreatingUser(false);
      }
    }
  };

  createUserRecord();
}, [session, isCreatingUser, createUserDid]);

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
