/**
 * Storage Constants
 * LocalStorage and SessionStorage key definitions
 */

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: "pmp_access_token",
  REFRESH_TOKEN: "pmp_refresh_token",
  TOKEN_EXPIRY: "pmp_token_expiry",
};

// General storage keys
export const STORAGE_KEYS = {
  // User data
  USER: "pmp_user",
  USER_ROLE: "pmp_user_role",
  USER_PREFERENCES: "pmp_user_preferences",

  // UI state
  THEME: "pmp_theme",
  SIDEBAR_STATE: "pmp_sidebar_state",
  SIDEBAR_COLLAPSED: "pmp_sidebar_collapsed",

  // Quiz session
  QUIZ_SESSION: "pmp_quiz_session",
  QUIZ_ANSWERS: "pmp_quiz_answers",
  QUIZ_TIMER: "pmp_quiz_timer",
  QUIZ_PROGRESS: "pmp_quiz_progress",

  // Notifications
  NOTIFICATION_PREFERENCES: "pmp_notification_prefs",
  LAST_NOTIFICATION_CHECK: "pmp_last_notif_check",

  // App state
  LAST_ROUTE: "pmp_last_route",
  LANGUAGE: "pmp_language",
  ONBOARDING_COMPLETED: "pmp_onboarding_completed",

  // Filters and search
  QUIZ_FILTERS: "pmp_quiz_filters",
  QUESTION_FILTERS: "pmp_question_filters",
  USER_FILTERS: "pmp_user_filters",
  GROUP_FILTERS: "pmp_group_filters",

  // Performance cache
  PERFORMANCE_CACHE: "pmp_performance_cache",
  ANALYTICS_CACHE: "pmp_analytics_cache",
};

// Session storage keys (temporary, cleared on tab close)
export const SESSION_KEYS = {
  TEMP_QUIZ_DATA: "pmp_temp_quiz_data",
  FORM_DRAFT: "pmp_form_draft",
  REDIRECT_URL: "pmp_redirect_url",
  VERIFICATION_EMAIL: "pmp_verification_email",
};

// Storage type enum
export const STORAGE_TYPE = {
  LOCAL: "localStorage",
  SESSION: "sessionStorage",
};

// Theme options
export const THEME_OPTIONS = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

// Sidebar state options
export const SIDEBAR_STATE = {
  EXPANDED: "expanded",
  COLLAPSED: "collapsed",
  HIDDEN: "hidden",
};

/**
 * Storage utility functions
 */

/**
 * Set item in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {string} storageType - 'localStorage' or 'sessionStorage'
 */
export const setStorageItem = (
  key,
  value,
  storageType = STORAGE_TYPE.LOCAL
) => {
  try {
    const storage =
      storageType === STORAGE_TYPE.SESSION ? sessionStorage : localStorage;
    const serializedValue = JSON.stringify(value);
    storage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error setting ${key} in ${storageType}:`, error);
  }
};

/**
 * Get item from storage
 * @param {string} key - Storage key
 * @param {string} storageType - 'localStorage' or 'sessionStorage'
 * @returns {any} Parsed value or null
 */
export const getStorageItem = (key, storageType = STORAGE_TYPE.LOCAL) => {
  try {
    const storage =
      storageType === STORAGE_TYPE.SESSION ? sessionStorage : localStorage;
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from ${storageType}:`, error);
    return null;
  }
};

/**
 * Remove item from storage
 * @param {string} key - Storage key
 * @param {string} storageType - 'localStorage' or 'sessionStorage'
 */
export const removeStorageItem = (key, storageType = STORAGE_TYPE.LOCAL) => {
  try {
    const storage =
      storageType === STORAGE_TYPE.SESSION ? sessionStorage : localStorage;
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from ${storageType}:`, error);
  }
};

/**
 * Clear all app-specific storage items
 * @param {string} storageType - 'localStorage' or 'sessionStorage'
 */
export const clearAppStorage = (storageType = STORAGE_TYPE.LOCAL) => {
  try {
    const storage =
      storageType === STORAGE_TYPE.SESSION ? sessionStorage : localStorage;
    const allKeys = Object.values({
      ...TOKEN_KEYS,
      ...STORAGE_KEYS,
      ...SESSION_KEYS,
    });

    allKeys.forEach((key) => {
      storage.removeItem(key);
    });
  } catch (error) {
    console.error(`Error clearing ${storageType}:`, error);
  }
};

/**
 * Clear authentication-related storage
 */
export const clearAuthStorage = () => {
  Object.values(TOKEN_KEYS).forEach((key) => {
    removeStorageItem(key);
  });
  removeStorageItem(STORAGE_KEYS.USER);
  removeStorageItem(STORAGE_KEYS.USER_ROLE);
};

/**
 * Check if storage is available
 * @param {string} storageType - 'localStorage' or 'sessionStorage'
 * @returns {boolean}
 */
export const isStorageAvailable = (storageType = STORAGE_TYPE.LOCAL) => {
  try {
    const storage =
      storageType === STORAGE_TYPE.SESSION ? sessionStorage : localStorage;
    const testKey = "__storage_test__";
    storage.setItem(testKey, "test");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
