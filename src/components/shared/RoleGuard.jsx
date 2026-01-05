/**
 * RoleGuard Component
 * Conditionally renders content based on user role
 * 
 * Usage:
 * <RoleGuard allowedRoles={["admin"]}>
 *   <Button>Admin Only Button</Button>
 * </RoleGuard>
 * 
 * <RoleGuard allowedRoles={["admin", "instructor"]} fallback={<DisabledButton />}>
 *   <Button>Create Quiz</Button>
 * </RoleGuard>
 */

import { useAuthStore } from "@/stores/auth.store";
import { hasAnyRole } from "@/utils/role.utils";

/**
 * RoleGuard - Conditionally render children based on user role
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Array of roles that can see the content
 * @param {React.ReactNode} props.children - Content to render if role matches
 * @param {React.ReactNode} props.fallback - Optional fallback content if role doesn't match
 * @returns {React.ReactNode}
 */
export const RoleGuard = ({ allowedRoles = [], children, fallback = null }) => {
  const { user } = useAuthStore();

  if (!user) {
    return fallback;
  }

  if (!hasAnyRole(user, allowedRoles)) {
    return fallback;
  }

  return children;
};

export default RoleGuard;
