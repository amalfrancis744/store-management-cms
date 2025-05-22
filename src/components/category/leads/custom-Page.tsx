import React, { useState, useEffect, RefObject } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule } from 'ag-grid-community';

// Register necessary modules
ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule]);

interface CustomPaginationProps {
  gridRef: RefObject<AgGridReact<any> | null>;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  totalPages: number;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  gridRef,
  pageSize,
  setPageSize,
  currentPage,
  totalPages,
}) => {
  const [hydrated, setHydrated] = useState(false);
  const [pageInputValu, setPageInputValue] = useState('1');

  // Prevent SSR mismatch
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    setPageInputValue((currentPage + 1).toString());
  }, [currentPage]);

  if (!hydrated) return null; // Prevent rendering on the server

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    if (gridRef.current?.api) {
      gridRef.current.api.paginationGetPageSize();
    }
  };

  const handlePreviousPage = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.paginationGoToPreviousPage();
    }
  };

  const handleNextPage = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.paginationGoToNextPage();
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      gridRef.current?.api?.paginationGoToPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxButtonsToShow = 5;

    if (totalPages <= maxButtonsToShow) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);
      const displayRange = maxButtonsToShow - 2;

      if (end - start + 1 < displayRange) {
        if (currentPage < totalPages / 2) {
          end = Math.min(totalPages - 2, start + displayRange - 1);
        } else {
          start = Math.max(1, end - displayRange + 1);
        }
      }

      if (start > 1) pages.push(-1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 2) pages.push(-1);
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
      {/* Page Size Selector */}
      <select
        className="border border-gray-300 rounded px-3 py-2 text-sm"
        value={pageSize}
        onChange={handlePageSizeChange}
      >
        {[10, 30, 50, 100].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          className={`px-4 py-2 text-sm font-medium bg-white border rounded 
                        ${
                          currentPage === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center">
          {getPageNumbers().map((pageNum, index) =>
            pageNum < 0 ? (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            ) : (
              <button
                key={`page-${pageNum}`}
                className={`w-8 h-8 flex items-center justify-center rounded 
                                    ${
                                      currentPage === pageNum
                                        ? 'bg-gray-300'
                                        : 'bg-gray-100'
                                    } cursor-pointer`}
                onClick={() => goToPage(pageNum)}
              >
                {pageNum + 1}
              </button>
            )
          )}
        </div>

        {/* Next Button */}
        <button
          className={`px-4 py-2 text-sm font-medium bg-gray-200 border rounded 
                        ${
                          currentPage >= totalPages - 1
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;
