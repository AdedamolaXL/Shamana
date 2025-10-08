import { User } from "@supabase/auth-helpers-nextjs";
import { UserDetails } from "@/types/index";
import { createContext, useContext, useEffect, useState } from "react";
import { useSessionContext, useUser as useSupaUser } from "@supabase/auth-helpers-react";

type UserContextType = {
    accessToken: string | null;
    user: User | null;
    userDetails: UserDetails | null;
    isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);

export interface Props {
    [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
    const {
        session,
        isLoading: isLoadingUser,
        supabaseClient: supabase
    } = useSessionContext();
    const user = useSupaUser();
    const accessToken = session?.access_token ?? null;
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    
    // fetch user details from 'users' table
    const getUserDetails = async () => {
        if (!user?.id) return { data: null, error: new Error('No user ID') };
        
        return await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();
    };
   
    // fetch user details when user or loading state changes
    useEffect(() => {
        const fetchUserData = async () => {
            if (user && !isLoadingData && !userDetails ) {
                setIsLoadingData(true);
                
                try {
                    const { data, error } = await getUserDetails();
                    
                    if (error) {
                        console.error('Error fetching user details:', error);
                        // Try one more time with a different approach
                        try {
                            const { data: retryData, error: retryError } = await supabase
                                .from('users')
                                .select('*')
                                .eq('id', user.id)
                                .maybeSingle();
                            
                            if (retryError) {
                                console.error('Retry also failed:', retryError);
                            } else if (retryData) {
                                setUserDetails(retryData as UserDetails);
                            }
                        } catch (retryError) {
                            console.error('Retry failed completely:', retryError);
                        }
                    } else {
                        setUserDetails(data as UserDetails);
                    }
                } catch (error) {
                    console.error('Error in user data fetch:', error);
                } finally {
                    setIsLoadingData(false);
                }
            } else if (!user && !isLoadingData) {
                setUserDetails(null);
            }
        };

        fetchUserData();
    }, [user, isLoadingUser]);

    // context value
    const value = {
        accessToken,
        user,
        userDetails,
        isLoading: isLoadingUser || isLoadingData,
    }

    return <UserContext.Provider value={value} {...props} />
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserContextProvider");
    }
    return context;
};


