import { create } from "zustand";

export type AuthModalView = "sign_in" | "sign_up";

interface AuthModalStore {
    isOpen: boolean;
    view: AuthModalView;
    onOpen: (view?: AuthModalView) => void;
    onClose: () => void;
    setView: (view?: AuthModalView) => void;
};

const useAuthModal = create<AuthModalStore>((set) => ({
    isOpen: false,
    view: "sign_in",
    onOpen: (view = 'sign_in') => set({ isOpen: true, view }),
    onClose: () => set({ isOpen: false }),
    setView: (view) => set({ view }),
}));

export default useAuthModal;
