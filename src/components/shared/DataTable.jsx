/**
 * DataTable Component
 * Reusable table with sorting, pagination, selection, and loading states
 * Supports both client-side and server-side pagination
 */

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/utils/cn";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import EmptyState from "./EmptyState";

const PAGE_SIZE_OPTIONS = [5, 10, 50, 100];

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data available",
  emptyDescription = "There are no items to display at the moment.",
  emptyIcon,
  emptyAction,
  onRowClick,
  sortable = true,
  paginated = true,
  pageSize: initialPageSize = 5,
  // Server-side pagination props
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  totalCount: externalTotalCount,
  onPageChange: externalOnPageChange,
  onPageSizeChange: externalOnPageSizeChange,
  // Selection props
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey = "id",
  className,
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);

  // Determine if using server-side pagination
  const isServerSide = externalOnPageChange !== undefined;
  
  // Use external or internal pagination state
  const currentPage = isServerSide ? externalCurrentPage : internalCurrentPage;
  const pageSize = internalPageSize;

  // Reset page when data changes (for client-side)
  useEffect(() => {
    if (!isServerSide) {
      setInternalCurrentPage(1);
    }
  }, [data, isServerSide]);

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  // Sorting logic (only for client-side)
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable || isServerSide) return safeData;

    return [...safeData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [safeData, sortColumn, sortDirection, sortable, isServerSide]);

  // Pagination logic (only for client-side)
  const paginatedData = useMemo(() => {
    if (!paginated || isServerSide) return sortedData;

    const startIndex = (internalCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, internalCurrentPage, pageSize, paginated, isServerSide]);

  // Calculate total pages
  const totalPages = isServerSide 
    ? externalTotalPages 
    : Math.max(1, Math.ceil(sortedData.length / pageSize));

  // Calculate total count for display
  const totalCount = isServerSide 
    ? (externalTotalCount || (externalTotalPages * pageSize))
    : sortedData.length;

  // Calculate display range
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handleSort = (columnKey) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    if (isServerSide) {
      externalOnPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    const size = parseInt(newSize, 10);
    setInternalPageSize(size);
    
    if (isServerSide && externalOnPageSizeChange) {
      externalOnPageSizeChange(size);
    } else {
      // Reset to page 1 when changing page size
      setInternalCurrentPage(1);
    }
  };

  // Get data to display
  const displayData = isServerSide ? safeData : paginatedData;

  // Selection handlers
  const isRowSelected = (row) => {
    const key = row[rowKey];
    return selectedRows.includes(key);
  };

  const isAllSelected = () => {
    if (displayData.length === 0) return false;
    return displayData.every((row) => selectedRows.includes(row[rowKey]));
  };

  const isSomeSelected = () => {
    return (
      displayData.some((row) => selectedRows.includes(row[rowKey])) &&
      !isAllSelected()
    );
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (isAllSelected()) {
      // Deselect all on current page
      const currentPageKeys = displayData.map((row) => row[rowKey]);
      onSelectionChange(
        selectedRows.filter((key) => !currentPageKeys.includes(key))
      );
    } else {
      // Select all on current page
      const currentPageKeys = displayData.map((row) => row[rowKey]);
      const newSelection = [...new Set([...selectedRows, ...currentPageKeys])];
      onSelectionChange(newSelection);
    }
  };

  const handleSelectRow = (row, e) => {
    e?.stopPropagation();
    if (!onSelectionChange) return;

    const key = row[rowKey];
    if (isRowSelected(row)) {
      onSelectionChange(selectedRows.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedRows, key]);
    }
  };

  const renderSortIcon = (columnKey) => {
    if (!sortable) return null;

    if (sortColumn === columnKey) {
      return sortDirection === "asc" ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      );
    }
    return <ChevronsUpDown className="w-4 h-4 opacity-50" />;
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card className={className}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {selectable && (
                  <th className="px-4 py-4 w-12">
                    <Skeleton width={18} height={18} />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {typeof column.header === "function"
                      ? column.header()
                      : column.header || column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(pageSize, 5) }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200">
                  {selectable && (
                    <td className="px-4 py-4">
                      <Skeleton width={18} height={18} />
                    </td>
                  )}
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <Skeleton height={20} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination skeleton */}
        {paginated && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <Skeleton width={200} height={20} />
            <Skeleton width={300} height={32} />
          </div>
        )}
      </Card>
    );
  }

  // Empty state - still show pagination controls
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <EmptyState
          title={emptyMessage}
          description={emptyDescription}
          icon={emptyIcon}
          action={emptyAction}
        />
        {/* Always show pagination controls */}
        {paginated && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-gray-500">
                Showing 0 of 0 results
              </span>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className={cn("overflow-visible", className)}>
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full min-w-full table-auto">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="px-4 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected()}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected();
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-white"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() =>
                    column.sortable !== false && handleSort(column.key)
                  }
                  className={cn(
                    "px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    !column.align && "text-left",
                    sortable &&
                      column.sortable !== false &&
                      "cursor-pointer hover:text-gray-900 select-none"
                  )}
                  style={{ width: column.width }}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      column.align === "center" && "justify-center",
                      column.align === "right" && "justify-end"
                    )}
                  >
                    {typeof column.header === "function"
                      ? column.header()
                      : column.header || column.label}
                    {column.sortable !== false && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayData.map((row, rowIndex) => (
              <tr
                key={row[rowKey] || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-colors hover:bg-gray-50",
                  onRowClick && "cursor-pointer",
                  isRowSelected(row) && "bg-blue-50"
                )}
              >
                {selectable && (
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isRowSelected(row)}
                      onChange={(e) => handleSelectRow(row, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-white"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right"
                    )}
                    style={{ width: column.width }}
                  >
                    {column.render ? (
                      column.render(row[column.key], row)
                    ) : (
                      <span className="text-sm text-gray-700">
                        {row[column.key]}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Always show when paginated is true */}
      {paginated && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-sm text-gray-500">
              Showing {startItem} to {endItem} of {totalCount} results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current, and neighbors
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-lg transition-colors",
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;