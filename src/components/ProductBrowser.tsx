import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useProducts } from "@/contexts/ProductsContext";
import { Product } from "@/services/types";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ProductBrowser = () => {
  const { products, loading, fetchProducts, searchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    active_only: true,
    skip: 0,
    limit: 12,
  });

  // Categories - you can expand this based on your actual categories
  const categories = [
    "Electronics",
    "Chemistry",
    "AR Cards",
    "Laboratory",
    "Educational",
  ];

  const displayProducts = isSearchMode ? searchResults : products;
  const totalPages = Math.ceil(displayProducts.length / filters.limit);
  const currentPage = Math.floor(filters.skip / filters.limit) + 1;

  // Fetch products with current filters
  useEffect(() => {
    if (!isSearchMode) {
      fetchProducts(filters);
    }
  }, [filters, isSearchMode]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearchMode(true);
      const results = await searchProducts(searchQuery);
      setSearchResults(results);
    } else {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      skip: key !== "skip" ? 0 : value, // Reset to first page when changing other filters
    }));
  };

  const handlePageChange = (direction: "prev" | "next") => {
    const newSkip =
      direction === "prev"
        ? Math.max(0, filters.skip - filters.limit)
        : filters.skip + filters.limit;

    handleFilterChange("skip", newSkip);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setSearchResults([]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Product Browser</h1>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
            Search
          </Button>
          {isSearchMode && (
            <Button variant="outline" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </div>

        {/* Filters */}
        {!isSearchMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      handleFilterChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="limit">Items per page</Label>
                  <Select
                    value={filters.limit.toString()}
                    onValueChange={(value) =>
                      handleFilterChange("limit", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active_only"
                    checked={filters.active_only}
                    onCheckedChange={(checked) =>
                      handleFilterChange("active_only", checked)
                    }
                  />
                  <Label htmlFor="active_only">Active products only</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Info */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {isSearchMode ? (
            <span>
              Search results for "{searchQuery}": {searchResults.length}{" "}
              products
            </span>
          ) : (
            <span>Showing {displayProducts.length} products</span>
          )}
        </div>

        {/* Pagination Controls */}
        {!isSearchMode && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isSearchMode
              ? "No products found for your search."
              : "No products available."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <Badge
                      variant={product.is_active ? "default" : "secondary"}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {product.category && (
                    <Badge variant="outline" className="w-fit">
                      {product.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {product.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price &&
                        product.original_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                    </div>

                    {product.discount_percentage > 0 && (
                      <Badge variant="destructive" className="w-fit">
                        {product.discount_percentage}% OFF
                      </Badge>
                    )}

                    <div className="text-sm text-gray-500">
                      Stock: {product.stock_quantity} units
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductBrowser;
