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

/**
 * Initial state
 */
const getInitialState = () => ({
  sidebarOpen: true,
  sidebarCollapsed: getStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) ?? false,
  mobileSidebarOpen: false,
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
      }),
      {
        name: "ui-storage",
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
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

export default useUIStore;
