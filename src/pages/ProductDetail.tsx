import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/contexts/ProductsContext";
import { Product } from "@/services/types";
import { ArrowLeft, DollarSign, Package, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setLoading(true);
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, getProductById]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Product Not Found
              </h2>
              <p className="text-gray-500 mb-6">
                The product you're looking for doesn't exist or has been
                removed.
              </p>
              <Button onClick={() => navigate("/products")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/products")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <Card>
              <CardContent className="p-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl">{product.name}</CardTitle>
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
                  <p className="text-gray-600 leading-relaxed">
                    {product.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Current Price:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {product.original_price &&
                      product.original_price > product.price && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Original Price:</span>
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        </div>
                      )}

                    {product.discount_percentage > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-600">Discount:</span>
                        <Badge variant="destructive">
                          {product.discount_percentage}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stock Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span>Stock Quantity:</span>
                    <Badge
                      variant={
                        product.stock_quantity > 0 ? "default" : "destructive"
                      }
                    >
                      {product.stock_quantity} units
                    </Badge>
                  </div>

                  {product.stock_quantity === 0 && (
                    <p className="text-red-600 text-sm mt-2">
                      This product is currently out of stock.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  disabled={product.stock_quantity === 0 || !product.is_active}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>

                {(!product.is_active || product.stock_quantity === 0) && (
                  <p className="text-sm text-gray-500 text-center">
                    {!product.is_active
                      ? "This product is currently unavailable."
                      : "This product is out of stock."}
                  </p>
                )}
              </div>

              {/* Product Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Product ID:</span>
                      <span className="font-mono">{product.id}</span>
                    </div>
                    {product.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Added:</span>
                        <span>
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {product.updated_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Updated:</span>
                        <span>
                          {new Date(product.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
