/**
 * DataTable Component
 * Reusable table with sorting, pagination, and loading states
 */

import { useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import EmptyState from "./EmptyState";

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No data available",
  emptyDescription = "There are no items to display at the moment.",
  onRowClick,
  sortable = true,
  paginated = true,
  pageSize = 10,
  className,
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection, sortable]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

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
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-800">
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
      </Card>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <EmptyState title={emptyMessage} description={emptyDescription} />
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50 border-b border-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() =>
                    column.sortable !== false && handleSort(column.key)
                  }
                  className={cn(
                    "px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",
                    sortable &&
                      column.sortable !== false &&
                      "cursor-pointer hover:text-white select-none"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable !== false && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-gray-800/50"
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? (
                      column.render(row[column.key], row)
                    ) : (
                      <span className="text-sm text-gray-200">
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

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                            ? "bg-purple-600 text-white"
                            : "bg-gray-800 text-white hover:bg-gray-700"
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
              className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DataTable;
