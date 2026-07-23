import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { fetchProductByHandle, ShopifyProduct, CartItem } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      try {
        const data = await fetchProductByHandle(handle);
        setProduct(data);
        if (data?.variants.edges.length > 0) {
          setSelectedVariantId(data.variants.edges[0].node.id);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [handle]);

  const selectedVariant = product?.variants.edges.find(
    (v) => v.node.id === selectedVariantId
  )?.node;

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const cartItem: CartItem = {
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    };

    addItem(cartItem);
    toast.success("Added to cart!", {
      description: `${product.title} (${selectedVariant.title}) x${quantity}`,
      position: "top-center",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/#merch">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = product.images.edges[0]?.node.url;
  const price = selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount;

  return (
    <>
      <Helmet>
        <title>{product.title} | Middleman Motors Merchandise</title>
        <meta name="description" content={(product.description || `Shop ${product.title} from Middleman Motors merchandise.`).slice(0, 160)} />
        <link rel="canonical" href={`https://www.middlemanmotors.com/product/${handle}`} />
        <meta property="og:title" content={`${product.title} | Middleman Motors Merchandise`} />
        <meta property="og:description" content={(product.description || `Shop ${product.title} from Middleman Motors merchandise.`).slice(0, 160)} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://www.middlemanmotors.com/product/${handle}`} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.title,
            "description": product.description,
            "image": imageUrl,
            "offers": {
              "@type": "Offer",
              "price": price,
              "priceCurrency": selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode || "USD",
              "availability": "https://schema.org/InStock",
              "url": `https://www.middlemanmotors.com/product/${handle}`
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-12 pt-32">
          <Link to="/#merch" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Link>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square bg-secondary/30 rounded-2xl overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                {product.title}
              </h1>
              
              <p className="text-3xl font-bold text-gradient-gold mb-6">
                ${parseFloat(price).toFixed(2)}
              </p>

              <p className="text-muted-foreground mb-8">
                {product.description}
              </p>

              {product.options.length > 0 && product.options[0].values.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    {product.options[0].name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.edges.map((variant) => (
                      <button
                        key={variant.node.id}
                        onClick={() => setSelectedVariantId(variant.node.id)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
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

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                variant="hero"
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;
