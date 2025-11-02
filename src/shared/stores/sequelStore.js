import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSequelStore = create(
  persist(
    (set, get) => ({
      // Sequel
      selectedSequelId: null,
      selectedSequel: null,
      
      // Intro
      selectedIntroId: null,
      selectedIntro: null,
      
      // Outro
      selectedOutroId: null,
      selectedOutro: null,

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

      // Устанавливаем выбранное intro
      setSelectedIntro: (intro) => {
        set({
          selectedIntroId: intro?.id || null,
          selectedIntro: intro,
        });
      },

      // Очищаем выбранное intro
      clearSelectedIntro: () => {
        set({
          selectedIntroId: null,
          selectedIntro: null,
        });
      },

      // Устанавливаем выбранное outro
      setSelectedOutro: (outro) => {
        set({
          selectedOutroId: outro?.id || null,
          selectedOutro: outro,
        });
      },

      // Очищаем выбранное outro
      clearSelectedOutro: () => {
        set({
          selectedOutroId: null,
          selectedOutro: null,
        });
      },

      // Очищаем все выбранные элементы
      clearAll: () => {
        set({
          selectedSequelId: null,
          selectedSequel: null,
          selectedIntroId: null,
          selectedIntro: null,
          selectedOutroId: null,
          selectedOutro: null,
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

      // Получаем выбранное intro
      getSelectedIntro: () => {
        const state = get();
        return {
          id: state.selectedIntroId,
          intro: state.selectedIntro,
        };
      },

      // Получаем выбранное outro
      getSelectedOutro: () => {
        const state = get();
        return {
          id: state.selectedOutroId,
          outro: state.selectedOutro,
        };
      },
    }),
    {
      name: "meract-scene-store", // переименуем стор для более общего названия
      partialize: (state) => ({
        selectedSequelId: state.selectedSequelId,
        selectedSequel: state.selectedSequel,
        selectedIntroId: state.selectedIntroId,
        selectedIntro: state.selectedIntro,
        selectedOutroId: state.selectedOutroId,
        selectedOutro: state.selectedOutro,
      }),
    },
  ),
);
