import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface ModernPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  className?: string;
  showInfo?: boolean;
  totalItems?: number;
  pageSize?: number;
}

const ModernPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNext = true,
  hasPrevious = true,
  className,
  showInfo = true,
  totalItems,
  pageSize,
}: ModernPaginationProps) => {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 7; // Show at most 7 page numbers

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Current page is near the beginning
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push("ellipsis");
        }
      } else if (currentPage >= totalPages - 3) {
        // Current page is near the end
        if (totalPages > 5) {
          pages.push("ellipsis");
        }
        for (let i = Math.max(2, totalPages - 4); i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // Current page is in the middle
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      }

      // Always show last page (if not already included)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (hasPrevious && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Pagination Info */}
      {showInfo && totalItems && pageSize && (
        <div className="text-sm text-gray-300">
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrevious}
              className={cn(
                "cursor-pointer transition-colors",
                !hasPrevious || currentPage <= 1
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "hover:bg-teal-900/50 text-teal-400 border-teal-400"
              )}
            />
          </PaginationItem>

          {pageNumbers.map((pageNum, index) => (
            <PaginationItem key={index}>
              {pageNum === "ellipsis" ? (
                <PaginationEllipsis className="text-gray-400" />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(pageNum)}
                  isActive={pageNum === currentPage}
                  className={cn(
                    "cursor-pointer transition-colors",
                    pageNum === currentPage
                      ? "bg-teal-600 text-white border-teal-600"
                      : "text-teal-400 border-teal-400 hover:bg-teal-900/50"
                  )}
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={handleNext}
              className={cn(
                "cursor-pointer transition-colors",
                !hasNext || currentPage >= totalPages
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "hover:bg-teal-900/50 text-teal-400 border-teal-400"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ModernPagination;
