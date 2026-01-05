/**
 * useRoleCheck Hook
 * Hook to check if user has required role
 */

import { useAuthStore } from "@/stores/auth.store";
import { hasAnyRole } from "@/utils/role.utils";

/**
 * useRoleCheck - Hook to check if user has required role
 * @param {string[]} allowedRoles - Array of roles to check
 * @returns {boolean}
 */
export const useRoleCheck = (allowedRoles = []) => {
  const { user } = useAuthStore();

  if (!user) {
    return false;
  }

  return hasAnyRole(user, allowedRoles);
};

export default useRoleCheck;
