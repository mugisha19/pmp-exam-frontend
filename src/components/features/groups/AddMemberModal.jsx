/**
 * Add Member Modal
 * Modal for adding members to a group
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Search, Users, Loader2 } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAddMemberMutation } from "@/hooks/queries/useGroupQueries";
import { getAvailableUsers } from "@/services/group.service";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { UserCell } from "@/components/shared/UserCell";
import { Badge } from "@/components/ui/Badge";

// Validation schema
const addMemberSchema = z.object({
  user_id: z.string().min(1, "Please select a user"),
  role: z.enum(["member", "instructor", "admin"]),
});

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "instructor", label: "Instructor" },
  { value: "admin", label: "Admin" },
];

export const AddMemberModal = ({ isOpen, onClose, group }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const addMemberMutation = useAddMemberMutation();
  const queryClient = useQueryClient();
  const observerTarget = useRef(null);
  const scrollContainerRef = useRef(null);

  // Fetch available users with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: usersLoading,
  } = useInfiniteQuery({
    queryKey: ["available-users", group?.group_id || group?.id, searchQuery],
    queryFn: ({ pageParam = 0 }) => {
      const groupId = group?.group_id || group?.id;
      return getAvailableUsers(groupId, {
        search: searchQuery,
        skip: pageParam,
        limit: 20,
      });
    },
    getNextPageParam: (lastPage, pages) => {
      const totalFetched = pages.reduce((acc, page) => acc + (page.users?.length || 0), 0);
      const hasMore = lastPage.total > totalFetched;
      return hasMore ? totalFetched : undefined;
    },
    enabled: isOpen && !!(group?.group_id || group?.id),
  });

  const users = data?.pages.flatMap((page) => page.users || []) || [];

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [target] = entries;
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { 
        threshold: 0.1,
        root: scrollContainerRef.current 
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      user_id: "",
      role: "member",
    },
  });

  const selectedUserId = watch("user_id");
  const selectedUser = users.find(
    (u) => (u.user_id || u.id) === selectedUserId
  );

  const onSubmit = async (data) => {
    if (!group) return;

    try {
      await addMemberMutation.mutateAsync({
        groupId: group.group_id || group.id,
        data: {
          user_id: data.user_id,
          role: data.role,
        },
      });
      queryClient.invalidateQueries(["available-users", group.group_id || group.id]);
      reset();
      setSearchQuery("");
      onClose();
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleClose = () => {
    reset();
    setSearchQuery("");
    onClose();
  };

  const handleUserSelect = (user) => {
    setValue("user_id", user.user_id || user.id);
  };

  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Member" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Group Info */}
        <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{group.name}</p>
            <p className="text-xs text-gray-500">
              {group.member_count || 0} current members
            </p>
          </div>
        </div>

        {/* Search Users */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Search Users
          </label>
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* User List */}
        <div 
          ref={scrollContainerRef}
          className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl"
        >
          {usersLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No users found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => {
                const userId = user.user_id || user.id;
                const isSelected = selectedUserId === userId;
                return (
                  <div
                    key={userId}
                    onClick={() => handleUserSelect(user)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <UserCell user={user} showEmail size="sm" />
                      {isSelected && (
                        <Badge variant="primary" size="sm">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Infinite scroll trigger & loading indicator */}
              {hasNextPage && (
                <div ref={observerTarget} className="p-4 text-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-sm">Loading more users...</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Scroll for more</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {errors.user_id && (
          <p className="text-sm text-red-500">{errors.user_id.message}</p>
        )}

        {/* Selected User Preview */}
        {selectedUser && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700 font-medium mb-2">
              Selected User
            </p>
            <UserCell user={selectedUser} showEmail />
          </div>
        )}

        {/* Role Selection */}
        <Select
          label="Member Role"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register("role")}
        />

        {/* Hidden field for user_id */}
        <input type="hidden" {...register("user_id")} />

        {/* Footer */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || addMemberMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || addMemberMutation.isPending}
            disabled={!selectedUserId}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Member
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default AddMemberModal;
