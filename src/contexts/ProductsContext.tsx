import { useToast } from "@/hooks/use-toast";
import { Product, productsService } from "@/services";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  fetchProducts: (params?: {
    skip?: number;
    limit?: number;
    active_only?: boolean;
    category?: string;
  }) => Promise<void>;
  createProduct: (
    product: Omit<Product, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
  getProductById: (id: string) => Promise<Product | null>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const fetchProducts = async (
    params: {
      skip?: number;
      limit?: number;
      active_only?: boolean;
      category?: string;
    } = { skip: 0, limit: 20, active_only: true }
  ) => {
    try {
      setLoading(true);
      const { data, error } = await productsService.getProducts(params);

      if (error) {
        throw new Error(error);
      }
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const createProduct = async (
    product: Omit<Product, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { data, error } = await productsService.createProduct(product);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      await fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await productsService.updateProduct(id, updates);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await productsService.deleteProduct(id);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      const { data, error } = await productsService.searchProducts(query);

      if (error) {
        throw new Error(error);
      }

      return data || [];
    } catch (error) {
      console.error("Error searching products:", error);
      toast({
        title: "Error",
        description: "Failed to search products",
        variant: "destructive",
      });
      return [];
    }
  };

  const getProductById = async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await productsService.getProductById(id);

      if (error) {
        throw new Error(error);
      }

      return data || null;
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        searchProducts,
        getProductById,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
