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

  // Custom toolbar
  customToolbar?: ReactNode;

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
  customToolbar,
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
    } // Default rendering based on value type
    if (typeof value === "boolean") {
      return (
        <Badge className={value ? "bg-primary" : "bg-destructive"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }

    return String(value);
  };
  const defaultRenderLoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <div className="text-foreground">{loadingText}</div>
    </div>
  );

  const defaultRenderEmptyState = () => (
    <div className="text-center py-8">
      {emptyIcon && <div className="mx-auto mb-4">{emptyIcon}</div>}
      <p className="text-muted-foreground">{emptyText}</p>
    </div>
  );
  const defaultRenderRow = (item: T, index: number) => (
    <div
      key={getValue(item, keyField) || index}
      className="p-4 bg-background/80 backdrop-blur-lg rounded-lg border border-border"
    >
      <div className="flex items-center justify-between">
        <div
          className="flex-1 grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
        >
          {columns.map((column) => (
            <div key={column.key} className={column.width}>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {column.label}
              </div>
              <div className="text-foreground">{renderCell(item, column)}</div>
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
                className={`border-primary/30 text-primary hover:bg-primary/10 ${
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
      className={`bg-background/80 backdrop-blur-lg border-border ${cardClassName}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <span className="text-primary">{icon}</span>}
            <div>
              <CardTitle className="text-foreground">{title}</CardTitle>
              {description && (
                <CardDescription className="text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              disabled={loading || refreshDisabled}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          )}
        </div>{" "}
      </CardHeader>

      {customToolbar && <div className="px-6">{customToolbar}</div>}

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
                  )}{" "}
                  {/* Spacer for balanced layout */}
                  <div className="order-1 sm:order-2"></div>
                </div>{" "}
                <ModernPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages || 1}
                  onPageChange={onPageChange}
                  hasNext={pagination.hasNextPage}
                  hasPrevious={pagination.hasPreviousPage}
                  showInfo={true}
                  totalItems={pagination.totalItems}
                  pageSize={pagination.pageSize}
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
