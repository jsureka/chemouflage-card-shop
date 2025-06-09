import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ModernPagination from "@/components/ui/ModernPagination";
import PageSizeSelector from "@/components/ui/PageSizeSelector";
import { RefreshCw } from "lucide-react";
import { ReactNode } from "react";

export interface TableColumn<T = any> {
  key: string;
  label: string;
  width?: string;
  render?: (item: T, value: any) => ReactNode;
  sortable?: boolean;
}

export interface TableAction<T = any> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: (item: T) => boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages?: number;
  pageSize: number;
  totalItems?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

interface AdminTableProps<T = any> {
  // Header props
  title: string;
  description?: string;
  icon?: ReactNode;

  // Data props
  data: T[];
  columns: TableColumn<T>[];
  keyField?: string;

  // Loading and empty states
  loading?: boolean;
  loadingText?: string;
  emptyIcon?: ReactNode;
  emptyText?: string;

  // Actions
  actions?: TableAction<T>[];
  onRefresh?: () => void;
  refreshDisabled?: boolean;
  // Pagination
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];

  // Styling
  className?: string;
  cardClassName?: string;

  // Custom render functions
  renderRow?: (item: T, index: number) => ReactNode;
  renderEmptyState?: () => ReactNode;
  renderLoadingState?: () => ReactNode;
}

const AdminTable = <T extends Record<string, any>>({
  title,
  description,
  icon,
  data,
  columns,
  keyField = "id",
  loading = false,
  loadingText = "Loading...",
  emptyIcon,
  emptyText = "No data found",
  actions = [],
  onRefresh,
  refreshDisabled = false,
  pagination,
  onPageChange,
  showPagination = true,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
  cardClassName = "",
  renderRow,
  renderEmptyState,
  renderLoadingState,
}: AdminTableProps<T>) => {
  const getValue = (item: T, key: string) => {
    return key.split(".").reduce((obj, k) => obj?.[k], item);
  };

  const renderCell = (item: T, column: TableColumn<T>) => {
    const value = getValue(item, column.key);

    if (column.render) {
      return column.render(item, value);
    }

    // Default rendering based on value type
    if (typeof value === "boolean") {
      return (
        <Badge className={value ? "bg-emerald-600" : "bg-red-600"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (value === null || value === undefined) {
      return <span className="text-gray-500">-</span>;
    }

    return String(value);
  };

  const defaultRenderLoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <div className="text-white">{loadingText}</div>
    </div>
  );

  const defaultRenderEmptyState = () => (
    <div className="text-center py-8">
      {emptyIcon && <div className="mx-auto mb-4">{emptyIcon}</div>}
      <p className="text-gray-400">{emptyText}</p>
    </div>
  );

  const defaultRenderRow = (item: T, index: number) => (
    <div
      key={getValue(item, keyField) || index}
      className="p-4 bg-teal-900/20 rounded-lg border border-teal-500/30"
    >
      <div className="flex items-center justify-between">
        <div
          className="flex-1 grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
        >
          {columns.map((column) => (
            <div key={column.key} className={column.width}>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                {column.label}
              </div>
              <div className="text-white">{renderCell(item, column)}</div>
            </div>
          ))}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center space-x-2 ml-4">
            {actions.map((action, actionIndex) => (
              <Button
                key={actionIndex}
                variant={action.variant || "outline"}
                size={action.size || "sm"}
                onClick={() => action.onClick(item)}
                disabled={action.disabled?.(item)}
                className={`text-teal-400 border-teal-400 hover:bg-teal-900/50 ${
                  action.className || ""
                }`}
              >
                {action.icon && (
                  <span className="w-4 h-4 mr-1">{action.icon}</span>
                )}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card
      className={`bg-teal-900/20 backdrop-blur-lg border-teal-500/30 ${cardClassName}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <span className="text-teal-400">{icon}</span>}
            <div>
              <CardTitle className="text-white">{title}</CardTitle>
              {description && (
                <CardDescription className="text-gray-300">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              className="text-teal-400 border-teal-400 hover:bg-teal-900/50"
              disabled={loading || refreshDisabled}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={className}>
        {loading ? (
          renderLoadingState ? (
            renderLoadingState()
          ) : (
            defaultRenderLoadingState()
          )
        ) : data.length === 0 ? (
          renderEmptyState ? (
            renderEmptyState()
          ) : (
            defaultRenderEmptyState()
          )
        ) : (
          <>
            <div className="space-y-4">
              {data.map((item, index) =>
                renderRow
                  ? renderRow(item, index)
                  : defaultRenderRow(item, index)
              )}
            </div>{" "}
            {/* Modern Pagination Controls */}
            {showPagination && pagination && onPageChange && (
              <div className="mt-6 pt-4 border-t border-teal-500/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  {/* Page Size Selector */}
                  {onPageSizeChange && (
                    <PageSizeSelector
                      value={pagination.pageSize}
                      onValueChange={onPageSizeChange}
                      options={pageSizeOptions}
                      disabled={loading}
                      className="order-2 sm:order-1"
                    />
                  )}

                  {/* Pagination Info for mobile */}
                  {pagination.totalItems && (
                    <div className="text-sm text-gray-300 order-1 sm:order-2">
                      Showing{" "}
                      <span className="font-medium">
                        {(pagination.currentPage - 1) * pagination.pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.currentPage * pagination.pageSize,
                          pagination.totalItems
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {pagination.totalItems}
                      </span>{" "}
                      results
                    </div>
                  )}
                </div>

                <ModernPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages || 1}
                  onPageChange={onPageChange}
                  hasNext={pagination.hasNextPage}
                  hasPrevious={pagination.hasPreviousPage}
                  showInfo={false} // We show custom info above
                  totalItems={pagination.totalItems}
                  pageSize={pagination.pageSize}
                  className="text-gray-300"
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTable;
