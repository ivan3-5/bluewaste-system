"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationControlsProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of records across all pages */
  totalRecords: number;
  /** Number of records per page */
  pageSize: number;
  /** Total number of pages (computed from totalRecords / pageSize if omitted) */
  totalPages?: number;
  /** Callback fired when page number changes */
  onPageChange: (page: number) => void;
  /** Callback fired when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page size options (defaults to [10, 25, 50, 100]) */
  pageSizeOptions?: number[];
  /** Noun describing the items (e.g., "reports", "users", "operations", "records") */
  itemName?: string;
  /** Whether controls are disabled (e.g., during mutations or loading) */
  disabled?: boolean;
  /** Whether to show the page size select dropdown (default: true) */
  showPageSize?: boolean;
  /** Optional container class name */
  className?: string;
  /** Compact presentation for constrained viewports or cards */
  compact?: boolean;
}

/**
 * Standard page size options per design specification: [10, 25, 50, 100]
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * Generates an array of page numbers with smart ellipsis windowing
 * e.g., [1, 2, 3, 4, 5, '...', 20] or [1, '...', 7, 8, 9, '...', 20]
 */
function getPageWindow(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near the start
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  // Near the end
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // In the middle
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

/**
 * Modern, responsive, reusable pagination control bar for BlueWaste System tables.
 */
export function PaginationControls({
  currentPage,
  totalRecords,
  pageSize,
  totalPages: propTotalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS as unknown as number[],
  itemName = "records",
  disabled = false,
  showPageSize = true,
  className,
  compact = false,
}: PaginationControlsProps) {
  const computedTotalPages = Math.max(
    1,
    propTotalPages ?? Math.ceil(totalRecords / pageSize)
  );

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const pages = useMemo(
    () => getPageWindow(currentPage, computedTotalPages),
    [currentPage, computedTotalPages]
  );

  const handlePageSelect = (page: number) => {
    if (page === currentPage || page < 1 || page > computedTotalPages || disabled) {
      return;
    }
    onPageChange(page);
  };

  const handlePageSizeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3.5 pt-4 pb-2 text-xs text-slate-600 transition-all",
        className
      )}
      aria-label="Table pagination"
    >
      {/* ── Left: Record Counts & Page Size Selector ── */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        {/* Record Range Counter */}
        <div className="text-slate-600 dark:text-slate-400 font-medium">
          {totalRecords === 0 ? (
            <span>No {itemName} to display</span>
          ) : (
            <span>
              Showing{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {startRecord.toLocaleString()}–{endRecord.toLocaleString()}
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                {totalRecords.toLocaleString()}
              </strong>{" "}
              {itemName}
            </span>
          )}
        </div>

        {/* Page Size Selector */}
        {showPageSize && onPageSizeChange && totalRecords > 0 && (
          <div className="flex items-center gap-1.5 pl-0 sm:pl-2 border-l-0 sm:border-l border-slate-200 dark:border-slate-800">
            <label
              htmlFor={`page-size-select-${itemName}`}
              className="text-slate-500 dark:text-slate-400 font-normal shrink-0"
            >
              Show
            </label>
            <select
              id={`page-size-select-${itemName}`}
              value={pageSize}
              disabled={disabled}
              onChange={handlePageSizeSelect}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              title="Items per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="dark:bg-slate-900 dark:text-slate-200">
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-slate-500 dark:text-slate-400 font-normal hidden lg:inline shrink-0">
              per page
            </span>
          </div>
        )}
      </div>

      {/* ── Right: Navigation Controls (Prev / Numbers / Next) ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
        {/* First Page Button (visible on wider screens when many pages) */}
        {!compact && computedTotalPages > 4 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageSelect(1)}
            disabled={currentPage <= 1 || disabled}
            className="h-8 w-8 p-0 hidden md:inline-flex text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            title="First page"
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePageSelect(currentPage - 1)}
          disabled={currentPage <= 1 || disabled}
          className="h-8 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
          title="Previous page"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page Number Pills (Desktop / Tablet) */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-slate-400 dark:text-slate-500 select-none"
                >
                  &hellip;
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <Button
                key={p}
                type="button"
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageSelect(p)}
                disabled={disabled}
                className={cn(
                  "h-8 min-w-8 px-2 text-xs transition-all",
                  isCurrent
                    ? "bg-primary font-bold text-white shadow-xs hover:bg-primary/95"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </Button>
            );
          })}
        </div>

        {/* Mobile Compact Page Indicator */}
        <div className="sm:hidden text-xs font-semibold text-slate-700 dark:text-slate-200 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
          {currentPage} / {computedTotalPages}
        </div>

        {/* Next Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePageSelect(currentPage + 1)}
          disabled={currentPage >= computedTotalPages || disabled}
          className="h-8 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
          title="Next page"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5 sm:ml-1" />
        </Button>

        {/* Last Page Button */}
        {!compact && computedTotalPages > 4 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageSelect(computedTotalPages)}
            disabled={currentPage >= computedTotalPages || disabled}
            className="h-8 w-8 p-0 hidden md:inline-flex text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            title="Last page"
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable client-side pagination hook that manages pagination state,
 * page-size adjustments, and automatically slices an array of data.
 */
export function useClientPagination<T>(items: T[], initialPageSize: number = 10) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const totalRecords = items.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Reset or clamp page if items shrink or current page exceeds total pages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const handlePageSizeChange = React.useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const resetPage = React.useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalRecords,
    totalPages,
    paginatedItems,
    resetPage,
  };
}
