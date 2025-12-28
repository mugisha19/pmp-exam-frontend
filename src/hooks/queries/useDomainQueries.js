/**
 * Domain React Query Hooks
 * Custom hooks for domain management operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as domainService from "@/services/domain.service";
import { queryKeys } from "@/lib/query-client";

/**
 * Get all domains query hook
 * @param {Object} options - Query options
 */
export const useDomains = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.domains?.list(options) || ["domains", "list", options],
    queryFn: () => domainService.getDomains(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch domains";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get domain by ID query hook
 * @param {string} domainId - Domain ID
 * @param {Object} options - Query options
 */
export const useDomain = (domainId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.domains?.detail(domainId) || ["domains", "detail", domainId],
    queryFn: () => domainService.getDomainById(domainId),
    enabled: !!domainId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch domain";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Create domain mutation hook
 */
export const useCreateDomainMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domainData) => domainService.createDomain(domainData),
    onSuccess: () => {
      // Invalidate domains list
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      toast.success("Domain created");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to create domain. Please try again.";
      if (error.errors) {
        Object.values(error.errors).forEach((err) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

/**
 * Update domain mutation hook
 */
export const useUpdateDomainMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ domainId, data }) => domainService.updateDomain(domainId, data),
    onSuccess: (data, variables) => {
      // Update specific domain in cache
      queryClient.setQueryData(
        queryKeys.domains?.detail(variables.domainId) || ["domains", "detail", variables.domainId],
        data
      );
      // Invalidate domains list
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      toast.success("Domain updated");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update domain. Please try again.";
      if (error.errors) {
        Object.values(error.errors).forEach((err) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

/**
 * Delete domain mutation hook
 */
export const useDeleteDomainMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domainId) => domainService.deleteDomain(domainId),
    onSuccess: (_, domainId) => {
      // Remove domain from cache
      queryClient.removeQueries({
        queryKey: queryKeys.domains?.detail(domainId) || ["domains", "detail", domainId],
      });
      // Invalidate domains list
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      toast.success("Domain deleted");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to delete domain. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export default {
  useDomains,
  useDomain,
  useCreateDomainMutation,
  useUpdateDomainMutation,
  useDeleteDomainMutation,
};

