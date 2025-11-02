import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSequelStore = create(
  persist(
    (set, get) => ({
      selectedSequelId: null,
      selectedSequel: null,

      // Устанавливаем выбранный сиквел
      setSelectedSequel: (sequel) => {
        set({
          selectedSequelId: sequel?.id || null,
          selectedSequel: sequel,
        });
      },

      // Очищаем выбранный сиквел
      clearSelectedSequel: () => {
        set({
          selectedSequelId: null,
          selectedSequel: null,
        });
      },

      // Получаем выбранный сиквел
      getSelectedSequel: () => {
        const state = get();
        return {
          id: state.selectedSequelId,
          sequel: state.selectedSequel,
        };
      },
    }),
    {
      name: "meract-sequel-store", // имя для localStorage
      partialize: (state) => ({
        selectedSequelId: state.selectedSequelId,
        selectedSequel: state.selectedSequel,
      }),
    },
  ),
);
