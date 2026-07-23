import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Loader2 } from "lucide-react";
import { fetchProducts, ShopifyProduct, CartItem } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const MerchStore = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(10);
        setProducts(data);
        // Initialize default sizes
        const defaults: Record<string, string> = {};
        data.forEach((product) => {
          if (product.node.variants.edges.length > 0) {
            defaults[product.node.id] = product.node.variants.edges[0].node.id;
          }
        });
        setSelectedSizes(defaults);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleSizeChange = (productId: string, variantId: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleAddToCart = (product: ShopifyProduct) => {
    const selectedVariantId = selectedSizes[product.node.id];
    const variant = product.node.variants.edges.find(
      (v) => v.node.id === selectedVariantId
    )?.node;

    if (!variant) return;

    const cartItem: CartItem = {
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    };

    addItem(cartItem);
    toast.success("Added to cart!", {
      description: `${product.node.title} (${variant.title})`,
      position: "top-center",
    });
  };

  if (loading) {
    return (
      <section id="merch" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section id="merch" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Official Merchandise
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
            Rep the <span className="text-gradient-gold">Middleman</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Premium apparel for the community. Show your support with our exclusive merchandise collection.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No products available yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {products.map((product) => {
              const selectedVariantId = selectedSizes[product.node.id];
              const selectedVariant = product.node.variants.edges.find(
                (v) => v.node.id === selectedVariantId
              )?.node;
              const price = selectedVariant?.price.amount || product.node.priceRange.minVariantPrice.amount;
              const imageUrl = product.node.images.edges[0]?.node.url;

              return (
                <div
                  key={product.node.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 group"
                >
                  <Link to={`/product/${product.node.handle}`}>
                    <div className="aspect-square bg-secondary/50 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.node.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/product/${product.node.handle}`}>
                      <h3 className="font-heading font-semibold text-foreground mb-1 truncate hover:text-primary transition-colors">
                        {product.node.title}
                      </h3>
                    </Link>
                    <p className="text-xl font-bold text-gradient-gold mb-3">
                      ${parseFloat(price).toFixed(2)}
                    </p>

                    {product.node.options.length > 0 && product.node.options[0].values.length > 1 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {product.node.variants.edges.map((variant) => (
                            <button
                              key={variant.node.id}
                              onClick={() => handleSizeChange(product.node.id, variant.node.id)}
                              className={`px-2 py-1 text-xs rounded border transition-all ${
                                selectedVariantId === variant.node.id
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              {variant.node.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => handleAddToCart(product)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MerchStore;
