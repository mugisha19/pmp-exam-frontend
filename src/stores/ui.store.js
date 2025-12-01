/**
 * UI Store
 * Global state management for UI-related state using Zustand
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
} from "@/constants/storage.constants";
import { THEME_OPTIONS } from "@/constants/storage.constants";

/**
 * Initial state
 */
const getInitialState = () => ({
  sidebarOpen: true,
  sidebarCollapsed: getStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) ?? false,
  mobileSidebarOpen: false,
  theme: getStorageItem(STORAGE_KEYS.THEME) ?? THEME_OPTIONS.DARK,
});

/**
 * UI Store
 */
export const useUIStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...getInitialState(),

        // Actions
        /**
         * Toggle sidebar open/closed
         */
        toggleSidebar: () => {
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            "ui/toggleSidebar"
          );
        },

        /**
         * Set sidebar open state
         * @param {boolean} isOpen - Sidebar open state
         */
        setSidebarOpen: (isOpen) => {
          set({ sidebarOpen: isOpen }, false, "ui/setSidebarOpen");
        },

        /**
         * Set sidebar collapsed state
         * @param {boolean} isCollapsed - Sidebar collapsed state
         */
        setSidebarCollapsed: (isCollapsed) => {
          set(
            { sidebarCollapsed: isCollapsed },
            false,
            "ui/setSidebarCollapsed"
          );
          setStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, isCollapsed);
        },

        /**
         * Toggle sidebar collapsed state
         */
        toggleSidebarCollapsed: () => {
          const newCollapsed = !get().sidebarCollapsed;
          set(
            { sidebarCollapsed: newCollapsed },
            false,
            "ui/toggleSidebarCollapsed"
          );
          setStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, newCollapsed);
        },

        /**
         * Toggle mobile sidebar open/closed
         */
        toggleMobileSidebar: () => {
          set(
            (state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen }),
            false,
            "ui/toggleMobileSidebar"
          );
        },

        /**
         * Open mobile sidebar
         */
        openMobileSidebar: () => {
          set({ mobileSidebarOpen: true }, false, "ui/openMobileSidebar");
        },

        /**
         * Close mobile sidebar
         */
        closeMobileSidebar: () => {
          set({ mobileSidebarOpen: false }, false, "ui/closeMobileSidebar");
        },

        /**
         * Set theme
         * @param {string} theme - Theme ('light' | 'dark' | 'system')
         */
        setTheme: (theme) => {
          set({ theme }, false, "ui/setTheme");
          setStorageItem(STORAGE_KEYS.THEME, theme);

          // Apply theme to document
          if (typeof window !== "undefined") {
            const root = window.document.documentElement;

            if (theme === THEME_OPTIONS.SYSTEM) {
              const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
              ).matches
                ? THEME_OPTIONS.DARK
                : THEME_OPTIONS.LIGHT;
              root.classList.remove(THEME_OPTIONS.LIGHT, THEME_OPTIONS.DARK);
              root.classList.add(systemTheme);
            } else {
              root.classList.remove(
                THEME_OPTIONS.LIGHT,
                THEME_OPTIONS.DARK,
                THEME_OPTIONS.SYSTEM
              );
              root.classList.add(theme);
            }
          }
        },

        /**
         * Toggle theme (switch between light and dark)
         */
        toggleTheme: () => {
          const currentTheme = get().theme;
          const newTheme =
            currentTheme === THEME_OPTIONS.DARK
              ? THEME_OPTIONS.LIGHT
              : THEME_OPTIONS.DARK;
          get().setTheme(newTheme);
        },

        /**
         * Reset UI state to defaults
         */
        resetUI: () => {
          set(getInitialState(), false, "ui/resetUI");
        },

        // Getters
        /**
         * Check if sidebar is open
         * @returns {boolean}
         */
        isSidebarOpen: () => {
          return get().sidebarOpen;
        },

        /**
         * Check if sidebar is collapsed
         * @returns {boolean}
         */
        isSidebarCollapsed: () => {
          return get().sidebarCollapsed;
        },

        /**
         * Get current theme
         * @returns {string}
         */
        getCurrentTheme: () => {
          return get().theme;
        },

        /**
         * Check if dark mode is active
         * @returns {boolean}
         */
        isDarkMode: () => {
          const theme = get().theme;

          if (theme === THEME_OPTIONS.SYSTEM && typeof window !== "undefined") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
          }

          return theme === THEME_OPTIONS.DARK;
        },
      }),
      {
        name: "ui-storage",
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
        }),
      }
    ),
    {
      name: "UIStore",
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Export selectors for optimized re-renders
 */
export const selectSidebarOpen = (state) => state.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.sidebarCollapsed;
export const selectTheme = (state) => state.theme;

export default useUIStore;
