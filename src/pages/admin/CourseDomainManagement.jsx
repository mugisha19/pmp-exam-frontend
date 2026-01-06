/**
 * Admin Course and Domain Management Page
 * Manage courses and domains on the same page with tabs
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Filter,
  GraduationCap,
  FolderTree,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardContent } from "@/components/ui/Card";
import {
  useCourses,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from "@/hooks/queries/useCourseQueries";
import {
  useDomains,
  useCreateDomainMutation,
  useUpdateDomainMutation,
  useDeleteDomainMutation,
} from "@/hooks/queries/useDomainQueries";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function CourseDomainManagement() {
  const [activeTab, setActiveTab] = useState("courses");
  
  // Course states
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState("");
  const [isCourseCreateModalOpen, setIsCourseCreateModalOpen] = useState(false);
  const [isCourseEditModalOpen, setIsCourseEditModalOpen] = useState(false);
  const [isCourseDeleteDialogOpen, setIsCourseDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Domain states
  const [domainSearchQuery, setDomainSearchQuery] = useState("");
  const [domainCourseFilter, setDomainCourseFilter] = useState("");
  const [domainStatusFilter, setDomainStatusFilter] = useState("");
  const [isDomainCreateModalOpen, setIsDomainCreateModalOpen] = useState(false);
  const [isDomainEditModalOpen, setIsDomainEditModalOpen] = useState(false);
  const [isDomainDeleteDialogOpen, setIsDomainDeleteDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);

  // Fetch courses
  const courseQueryParams = useMemo(() => {
    const params = { skip: 0, limit: 100 };
    if (courseStatusFilter !== "") {
      params.is_active = courseStatusFilter === "true";
    }
    return params;
  }, [courseStatusFilter]);

  const { data: coursesData, isLoading: coursesLoading, refetch: refetchCourses } = useCourses(courseQueryParams);
  const createCourseMutation = useCreateCourseMutation();
  const updateCourseMutation = useUpdateCourseMutation();
  const deleteCourseMutation = useDeleteCourseMutation();

  const courses = useMemo(() => {
    const items = coursesData?.items || coursesData || [];
    if (courseSearchQuery) {
      return items.filter(
        (course) =>
          course.name.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(courseSearchQuery.toLowerCase())
      );
    }
    return items;
  }, [coursesData, courseSearchQuery]);

  // Fetch domains
  const domainQueryParams = useMemo(() => {
    const params = { skip: 0, limit: 100 };
    if (domainCourseFilter) {
      params.course_id = domainCourseFilter;
    }
    if (domainStatusFilter !== "") {
      params.is_active = domainStatusFilter === "true";
    }
    return params;
  }, [domainCourseFilter, domainStatusFilter]);

  const { data: domainsData, isLoading: domainsLoading, refetch: refetchDomains } = useDomains(domainQueryParams);
  const createDomainMutation = useCreateDomainMutation();
  const updateDomainMutation = useUpdateDomainMutation();
  const deleteDomainMutation = useDeleteDomainMutation();

  const domains = useMemo(() => {
    const items = domainsData?.items || domainsData || [];
    if (domainSearchQuery) {
      return items.filter(
        (domain) =>
          domain.name.toLowerCase().includes(domainSearchQuery.toLowerCase()) ||
          domain.description?.toLowerCase().includes(domainSearchQuery.toLowerCase())
      );
    }
    return items;
  }, [domainsData, domainSearchQuery]);

  // Course options for domain filter
  const courseOptions = useMemo(() => {
    const options = [{ value: "", label: "All Courses" }];
    courses.forEach((course) => {
      options.push({
        value: course.course_id,
        label: course.name,
      });
    });
    return options;
  }, [courses]);

  // Course handlers
  const handleCreateCourse = useCallback(() => {
    setIsCourseCreateModalOpen(true);
  }, []);

  const handleEditCourse = useCallback((course) => {
    setSelectedCourse(course);
    setIsCourseEditModalOpen(true);
  }, []);

  const handleDeleteCourse = useCallback((course) => {
    setSelectedCourse(course);
    setIsCourseDeleteDialogOpen(true);
  }, []);

  const handleConfirmDeleteCourse = useCallback(async () => {
    if (!selectedCourse) return;

    try {
      await deleteCourseMutation.mutateAsync(selectedCourse.course_id);
      setIsCourseDeleteDialogOpen(false);
      setSelectedCourse(null);
      refetchCourses();
    } catch (error) {
      // Error handled by mutation
    }
  }, [selectedCourse, deleteCourseMutation, refetchCourses]);

  const handleCourseSubmit = useCallback(async (data, isEdit = false) => {
    try {
      if (isEdit && selectedCourse) {
        await updateCourseMutation.mutateAsync({
          courseId: selectedCourse.course_id,
          data,
        });
        setIsCourseEditModalOpen(false);
      } else {
        await createCourseMutation.mutateAsync(data);
        setIsCourseCreateModalOpen(false);
      }
      setSelectedCourse(null);
      refetchCourses();
    } catch (error) {
      // Error handled by mutation
    }
  }, [selectedCourse, createCourseMutation, updateCourseMutation, refetchCourses]);

  // Domain handlers
  const handleCreateDomain = useCallback(() => {
    setIsDomainCreateModalOpen(true);
  }, []);

  const handleEditDomain = useCallback((domain) => {
    setSelectedDomain(domain);
    setIsDomainEditModalOpen(true);
  }, []);

  const handleDeleteDomain = useCallback((domain) => {
    setSelectedDomain(domain);
    setIsDomainDeleteDialogOpen(true);
  }, []);

  const handleConfirmDeleteDomain = useCallback(async () => {
    if (!selectedDomain) return;

    try {
      await deleteDomainMutation.mutateAsync(selectedDomain.domain_id);
      setIsDomainDeleteDialogOpen(false);
      setSelectedDomain(null);
      refetchDomains();
    } catch (error) {
      // Error handled by mutation
    }
  }, [selectedDomain, deleteDomainMutation, refetchDomains]);

  const handleDomainSubmit = useCallback(async (data, isEdit = false) => {
    try {
      if (isEdit && selectedDomain) {
        await updateDomainMutation.mutateAsync({
          domainId: selectedDomain.domain_id,
          data,
        });
        setIsDomainEditModalOpen(false);
      } else {
        await createDomainMutation.mutateAsync(data);
        setIsDomainCreateModalOpen(false);
      }
      setSelectedDomain(null);
      refetchDomains();
    } catch (error) {
      // Error handled by mutation
    }
  }, [selectedDomain, createDomainMutation, updateDomainMutation, refetchDomains]);

  // Course columns
  const courseColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Course Name",
        sortable: true,
        render: (_, course) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{course?.name}</span>
            {course?.description && (
              <span className="text-sm text-gray-500 truncate max-w-lg">
                {course.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "is_active",
        header: "Status",
        sortable: true,
        render: (_, course) => (
          <Badge variant={course?.is_active ? "success" : "secondary"}>
            {course?.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        key: "created_at",
        header: "Created",
        sortable: true,
        render: (_, course) => (
          <span className="text-sm text-gray-600">
            {course?.created_at
              ? new Date(course.created_at).toLocaleDateString()
              : "N/A"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (_, course) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditCourse(course);
              }}
              title="Edit course"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCourse(course);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete course"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEditCourse, handleDeleteCourse]
  );

  // Domain columns
  const domainColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Domain Name",
        sortable: true,
        render: (_, domain) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{domain?.name}</span>
            {domain?.description && (
              <span className="text-sm text-gray-500 truncate max-w-lg">
                {domain.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "course",
        header: "Course",
        sortable: true,
        render: (_, domain) => {
          const course = courses.find((c) => c.course_id === domain?.course_id);
          return (
            <span className="text-sm text-gray-700">
              {course?.name || "Unknown Course"}
            </span>
          );
        },
      },
      {
        key: "is_active",
        header: "Status",
        sortable: true,
        render: (_, domain) => (
          <Badge variant={domain?.is_active ? "success" : "secondary"}>
            {domain?.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        key: "created_at",
        header: "Created",
        sortable: true,
        render: (_, domain) => (
          <span className="text-sm text-gray-600">
            {domain?.created_at
              ? new Date(domain.created_at).toLocaleDateString()
              : "N/A"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (_, domain) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditDomain(domain);
              }}
              title="Edit domain"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteDomain(domain);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete domain"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [courses, handleEditDomain, handleDeleteDomain]
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Course & Domain Management"
        subtitle="Manage courses and domains to organize your content structure"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Courses
            </div>
          </TabsTrigger>
          <TabsTrigger value="domains">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              Domains
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardContent className="p-6">
              {/* Course Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search courses..."
                        value={courseSearchQuery}
                        onChange={(e) => setCourseSearchQuery(e.target.value)}
                        className="pl-9"
                        size="sm"
                      />
                    </div>
                    <div className="w-48">
                      <Select
                        value={courseStatusFilter}
                        onChange={(e) => setCourseStatusFilter(e.target.value)}
                        options={STATUS_OPTIONS}
                        size="sm"
                      />
                    </div>
                    {(courseSearchQuery || courseStatusFilter) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCourseSearchQuery("");
                          setCourseStatusFilter("");
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <Button onClick={handleCreateCourse} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </div>
              </div>

              {/* Courses Table */}
              <DataTable
                data={courses}
                columns={courseColumns}
                loading={coursesLoading}
                rowKey="course_id"
                paginated={true}
                emptyMessage="No courses found"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains">
          <Card>
            <CardContent className="p-6">
              {/* Domain Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search domains..."
                        value={domainSearchQuery}
                        onChange={(e) => setDomainSearchQuery(e.target.value)}
                        className="pl-9"
                        size="sm"
                      />
                    </div>
                    <div className="w-48">
                      <Select
                        value={domainCourseFilter}
                        onChange={(e) => setDomainCourseFilter(e.target.value)}
                        options={courseOptions}
                        size="sm"
                      />
                    </div>
                    <div className="w-48">
                      <Select
                        value={domainStatusFilter}
                        onChange={(e) => setDomainStatusFilter(e.target.value)}
                        options={STATUS_OPTIONS}
                        size="sm"
                      />
                    </div>
                    {(domainSearchQuery || domainCourseFilter || domainStatusFilter) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDomainSearchQuery("");
                          setDomainCourseFilter("");
                          setDomainStatusFilter("");
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <Button onClick={handleCreateDomain} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Domain
                  </Button>
                </div>
              </div>

              {/* Domains Table */}
              <DataTable
                data={domains}
                columns={domainColumns}
                loading={domainsLoading}
                rowKey="domain_id"
                paginated={true}
                emptyMessage="No domains found"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Create/Edit Modal */}
      <CourseModal
        isOpen={isCourseCreateModalOpen || isCourseEditModalOpen}
        onClose={() => {
          setIsCourseCreateModalOpen(false);
          setIsCourseEditModalOpen(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleCourseSubmit}
        course={selectedCourse}
        isEdit={isCourseEditModalOpen}
      />

      {/* Course Delete Dialog */}
      <ConfirmDialog
        isOpen={isCourseDeleteDialogOpen}
        onClose={() => {
          setIsCourseDeleteDialogOpen(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleConfirmDeleteCourse}
        title="Delete Course"
        message={`Are you sure you want to delete "${selectedCourse?.name}"? This action cannot be undone and will delete all associated domains and topics.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteCourseMutation.isPending}
      />

      {/* Domain Create/Edit Modal */}
      <DomainModal
        isOpen={isDomainCreateModalOpen || isDomainEditModalOpen}
        onClose={() => {
          setIsDomainCreateModalOpen(false);
          setIsDomainEditModalOpen(false);
          setSelectedDomain(null);
        }}
        onSubmit={handleDomainSubmit}
        domain={selectedDomain}
        courses={courses}
        isEdit={isDomainEditModalOpen}
      />

      {/* Domain Delete Dialog */}
      <ConfirmDialog
        isOpen={isDomainDeleteDialogOpen}
        onClose={() => {
          setIsDomainDeleteDialogOpen(false);
          setSelectedDomain(null);
        }}
        onConfirm={handleConfirmDeleteDomain}
        title="Delete Domain"
        message={`Are you sure you want to delete "${selectedDomain?.name}"? This action cannot be undone and will delete all associated topics.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteDomainMutation.isPending}
      />
    </div>
  );
}

/**
 * Course Modal Component
 */
function CourseModal({ isOpen, onClose, onSubmit, course, isEdit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Reset form when modal opens/closes or course changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && course) {
        setName(course.name || "");
        setDescription(course.description || "");
        setIsActive(course.is_active !== undefined ? course.is_active : true);
      } else {
        setName("");
        setDescription("");
        setIsActive(true);
      }
    }
  }, [isOpen, isEdit, course]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Course name is required");
      return;
    }

    onSubmit(
      {
        name: name.trim(),
        description: description.trim() || null,
        is_active: isActive,
      },
      isEdit
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Course" : "Create Course"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ModalBody>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter course name"
              required
              size="sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Update Course" : "Create Course"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/**
 * Domain Modal Component
 */
function DomainModal({ isOpen, onClose, onSubmit, domain, courses, isEdit }) {
  const [courseId, setCourseId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Reset form when modal opens/closes or domain changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && domain) {
        setCourseId(domain.course_id || "");
        setName(domain.name || "");
        setDescription(domain.description || "");
        setIsActive(domain.is_active !== undefined ? domain.is_active : true);
      } else {
        setCourseId("");
        setName("");
        setDescription("");
        setIsActive(true);
      }
    }
  }, [isOpen, isEdit, domain]);

  const courseOptions = courses.map((course) => ({
    value: course.course_id,
    label: course.name,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Domain name is required");
      return;
    }
    if (!courseId && !isEdit) {
      toast.error("Please select a course");
      return;
    }

    onSubmit(
      {
        course_id: courseId || domain?.course_id,
        name: name.trim(),
        description: description.trim() || null,
        is_active: isActive,
      },
      isEdit
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Domain" : "Create Domain"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ModalBody>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course <span className="text-red-500">*</span>
              </label>
              <Select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                options={courseOptions}
                placeholder="Select a course"
                required
                size="sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter domain name"
              required
              size="sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter domain description"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActiveDomain"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActiveDomain" className="text-sm text-gray-700">
              Active
            </label>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Update Domain" : "Create Domain"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

