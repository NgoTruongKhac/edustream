import { create } from "zustand";

interface ShowModalStore {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

export const useShowModalStore = create<ShowModalStore>()((set) => ({
  showModal: false,

  setShowModal: (show: boolean) => {
    set({ showModal: show });
  },
}));
