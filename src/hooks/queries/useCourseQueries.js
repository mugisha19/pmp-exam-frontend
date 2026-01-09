/**
 * Course React Query Hooks
 * Custom hooks for course management operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as courseService from "@/services/course.service";
import { queryKeys } from "@/lib/query-client";

/**
 * Get all courses query hook
 * @param {Object} options - Query options
 */
export const useCourses = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.courses?.list(options) || ["courses", "list", options],
    queryFn: () => courseService.getCourses(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch courses";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get course by ID query hook
 * @param {string} courseId - Course ID
 * @param {Object} options - Query options
 */
export const useCourse = (courseId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.courses?.detail(courseId) || ["courses", "detail", courseId],
    queryFn: () => courseService.getCourseById(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch course";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Create course mutation hook
 */
export const useCreateCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseData) => courseService.createCourse(courseData),
    onSuccess: () => {
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to create course. Please try again.";
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
 * Update course mutation hook
 */
export const useUpdateCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }) => courseService.updateCourse(courseId, data),
    onSuccess: (data, variables) => {
      // Update specific course in cache
      queryClient.setQueryData(
        queryKeys.courses?.detail(variables.courseId) || ["courses", "detail", variables.courseId],
        data
      );
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update course. Please try again.";
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
 * Delete course mutation hook
 */
export const useDeleteCourseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId) => courseService.deleteCourse(courseId),
    onSuccess: (_, courseId) => {
      // Remove course from cache
      queryClient.removeQueries({
        queryKey: queryKeys.courses?.detail(courseId) || ["courses", "detail", courseId],
      });
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to delete course. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export default {
  useCourses,
  useCourse,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
};

