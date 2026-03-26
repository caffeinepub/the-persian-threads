import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Facebook,
  Heart,
  Instagram,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Twitter,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AdminPanel from "./AdminPanel";
import { Category } from "./backend";
import { useProducts, useSubmitContact } from "./hooks/useQueries";

const NAV_LINKS = [
  { label: "Women", href: "#collection", filter: Category.Women },
  { label: "Men", href: "#collection", filter: Category.Men },
  { label: "Shawls", href: "#collection", filter: Category.Shawls },
  { label: "Custom Orders", href: "#contact", filter: null },
  { label: "Contact", href: "#contact", filter: null },
];

const BRAND_IMAGE =
  "/assets/uploads/img_2373-019d298c-eaa8-7709-bdf4-45a070a141e7-1.png";

interface CartItem {
  id: bigint;
  name: string;
  price: bigint;
  image: string;
  quantity: number;
}

function formatPrice(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

// ── Category Slideshow ──────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  Women: "Women's Collection",
  Men: "Men's Collection",
  Shawls: "Shawls & Wraps",
};

function CategorySlideshow({ category }: { category: string }) {
  const storageKey = `persian_category_images_${category}`;
  const [images, setImages] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function sync() {
      try {
        const raw = localStorage.getItem(storageKey);
        setImages(raw ? JSON.parse(raw) : []);
        setCurrent(0);
      } catch {
        setImages([]);
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [storageKey]);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length]);

  if (images.length === 0) return null;

  function prev() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }

  function next() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent((c) => (c + 1) % images.length);
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl mb-10 shadow-lg"
      style={{ aspectRatio: "16/7" }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt={`${category} slide ${current + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute bottom-6 left-8 text-white z-10">
        <p className="text-xs tracking-[0.3em] uppercase text-white/70 mb-1">
          The Persian Threads
        </p>
        <h3 className="font-serif text-2xl md:text-3xl font-bold">
          {CATEGORY_LABELS[category] ?? category}
        </h3>
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
            {images.map((img, i) => (
              <button
                key={img.slice(-20) + String(i)}
                type="button"
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === current ? "bg-white scale-125" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Checkout Modal ──────────────────────────────────────────────────────────
function CheckoutModal({
  open,
  onClose,
  items,
  subtotal,
  whatsappPhone,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: bigint;
  whatsappPhone: string;
  onConfirm: () => void;
}) {
  const upiId = `${whatsappPhone}@upi`;

  const waText = encodeURIComponent(
    `Hello! I'd like to order:\n${items.map((i) => `• ${i.name} (x${i.quantity}) — ${formatPrice(i.price * BigInt(i.quantity))}`).join("\n")}\n\nTotal: ${formatPrice(subtotal)}`,
  );

  function copyUpi() {
    navigator.clipboard
      .writeText(upiId)
      .then(() => {
        toast.success(
          `UPI ID copied! Pay ${formatPrice(subtotal)} to ${upiId}`,
        );
      })
      .catch(() => {
        toast.error(`Could not copy UPI ID. Please copy manually: ${upiId}`);
      });
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/${whatsappPhone}?text=${waText}`, "_blank");
    onConfirm();
    onClose();
    toast.success("Order placed! We'll confirm on WhatsApp.");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full" data-ocid="checkout.dialog">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Complete Your Order
          </DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <div className="mt-2 space-y-3">
          <p className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
            Order Summary
          </p>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={String(item.id)}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-foreground">
                  {item.name}
                  <span className="text-muted-foreground ml-1">
                    ×{item.quantity}
                  </span>
                </span>
                <span className="font-semibold text-foreground">
                  {formatPrice(item.price * BigInt(item.quantity))}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
              Grand Total
            </span>
            <span className="font-serif text-2xl font-bold text-primary">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="mt-4 space-y-3">
          <p className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
            Payment Options
          </p>

          <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Pay via UPI
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{upiId}</p>
              </div>
              <button
                type="button"
                onClick={copyUpi}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium tracking-wide px-3 py-2 rounded-full transition-all duration-200"
                data-ocid="checkout.primary_button"
              >
                <Copy size={12} />
                Copy UPI
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy the UPI ID and pay using any UPI app (GPay, PhonePe, Paytm).
              After payment, confirm your order on WhatsApp.
            </p>
          </div>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#1fb356] text-white text-center rounded-full py-3 text-sm tracking-widest uppercase font-medium transition-all duration-300"
            data-ocid="checkout.confirm_button"
          >
            📱 Confirm Order on WhatsApp
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-center rounded-full py-2.5 text-xs tracking-widest uppercase font-medium transition-all duration-200"
            data-ocid="checkout.cancel_button"
          >
            Back to Cart
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Cart Drawer ─────────────────────────────────────────────────────────────
function CartDrawer({
  open,
  onClose,
  items,
  onRemove,
  onUpdateQty,
  onClearCart,
  whatsappPhone,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: bigint) => void;
  onUpdateQty: (id: bigint, delta: number) => void;
  onClearCart: () => void;
  whatsappPhone: string;
}) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * BigInt(item.quantity),
    0n,
  );

  const waText = encodeURIComponent(
    `Hello! I'd like to order:\n${items.map((i) => `• ${i.name} (x${i.quantity})`).join("\n")}\n\nTotal: ${formatPrice(subtotal)}`,
  );

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md flex flex-col p-0"
          data-ocid="cart.sheet"
        >
          <SheetHeader className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-serif text-xl flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" />
                Your Cart
              </SheetTitle>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                data-ocid="cart.close_button"
              >
                <X size={20} />
              </button>
            </div>
          </SheetHeader>

          {items.length === 0 ? (
            <div
              className="flex-1 flex flex-col items-center justify-center text-center px-8"
              data-ocid="cart.empty_state"
            >
              <div className="text-5xl mb-4">🧵</div>
              <p className="font-serif text-lg text-foreground mb-2">
                Your cart is empty
              </p>
              <p className="text-muted-foreground text-sm">
                Add some beautiful pieces to get started.
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-4" data-ocid="cart.list">
                  {items.map((item, i) => (
                    <div
                      key={String(item.id)}
                      className="flex gap-4 items-start"
                      data-ocid={`cart.item.${i + 1}`}
                    >
                      <img
                        src={item.image || BRAND_IMAGE}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-semibold text-sm text-foreground truncate">
                          {item.name}
                        </p>
                        {/* Unit price */}
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {formatPrice(item.price)} each
                        </p>
                        {/* Line total */}
                        <p className="text-primary font-bold text-sm mt-0.5">
                          {formatPrice(item.price * BigInt(item.quantity))}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                            data-ocid={`cart.item.${i + 1}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                            data-ocid={`cart.item.${i + 1}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        aria-label="Remove"
                        data-ocid={`cart.delete_button.${i + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="px-6 py-5 border-t border-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
                    Subtotal
                  </span>
                  <span className="font-serif text-xl font-bold text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {/* Buy Now — opens checkout modal */}
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className="block w-full bg-amber-500 hover:bg-amber-600 text-white text-center rounded-full py-3 text-sm tracking-widest uppercase font-semibold transition-all duration-300 shadow-sm"
                  data-ocid="cart.primary_button"
                >
                  🛍️ Buy Now
                </button>
                {/* WhatsApp quick order */}
                <a
                  href={`https://wa.me/${whatsappPhone}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="cart.secondary_button"
                  className="block w-full bg-[#25D366] hover:bg-[#1fb356] text-white text-center rounded-full py-3 text-sm tracking-widest uppercase font-medium transition-all duration-300"
                >
                  📱 Order via WhatsApp
                </a>
                <p className="text-xs text-muted-foreground text-center">
                  We'll confirm your order on WhatsApp
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        subtotal={subtotal}
        whatsappPhone={whatsappPhone}
        onConfirm={onClearCart}
      />
    </>
  );
}

function StoreFront() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactSuccess, setContactSuccess] = useState(false);

  const { data: allProducts = [] } = useProducts();
  const submitContact = useSubmitContact();

  const collectionRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const displayedProducts = activeFilter
    ? allProducts.filter((p) => p.category === activeFilter)
    : allProducts;

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  function addToCart(product: {
    id: bigint;
    name: string;
    price: bigint;
    image: string;
  }) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(id: bigint) {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id: bigint, delta: number) {
    setCartItems((prev) => {
      return prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0);
    });
  }

  function clearCart() {
    setCartItems([]);
  }

  function scrollTo(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submitContact.mutateAsync(contactForm);
      setContactSuccess(true);
      setContactForm({ name: "", email: "", message: "" });
      toast.success("Message sent! We'll get back to you soon.");
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  }

  const storedContact = (() => {
    try {
      const raw = localStorage.getItem("persian_threads_contact");
      return raw ? JSON.parse(raw) : { phone: "9906099884" };
    } catch {
      return { phone: "9906099884" };
    }
  })();
  const whatsappPhone = (storedContact.phone || "9906099884").replace(
    /\D/g,
    "",
  );

  const activeCategoryKey =
    activeFilter === Category.Women
      ? "Women"
      : activeFilter === Category.Men
        ? "Men"
        : activeFilter === Category.Shawls
          ? "Shawls"
          : null;

  const FILTERS = [
    { label: "All", value: null },
    { label: "Women", value: Category.Women },
    { label: "Men", value: Category.Men },
    { label: "Shawls", value: Category.Shawls },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* ── CART DRAWER ── */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
        onClearCart={clearCart}
        whatsappPhone={whatsappPhone}
      />

      {/* ── NAVBAR ── */}
      <header
        className="sticky top-0 z-50 bg-white border-b border-border shadow-xs"
        data-ocid="navbar.panel"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <a
              href="/"
              className="font-serif text-xl md:text-2xl font-bold text-primary tracking-wider"
              data-ocid="navbar.link"
            >
              THE PERSIAN THREADS 🧵
            </a>

            <nav
              className="hidden lg:flex items-center gap-8"
              data-ocid="navbar.panel"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  data-ocid="navbar.link"
                  className="text-xs tracking-widest uppercase font-medium text-foreground hover:text-primary transition-colors duration-200"
                  onClick={(e) => {
                    if (link.filter !== null && link.href === "#collection") {
                      e.preventDefault();
                      setActiveFilter(link.filter);
                      scrollTo(collectionRef);
                    } else if (link.href === "#contact") {
                      e.preventDefault();
                      scrollTo(contactRef);
                    }
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4 text-foreground">
              <button
                type="button"
                className="hover:text-primary transition-colors p-1"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <button
                type="button"
                className="hover:text-primary transition-colors p-1"
                aria-label="Wishlist"
              >
                <Heart size={18} />
              </button>
              <button
                type="button"
                className="hover:text-primary transition-colors p-1 relative"
                aria-label="Cart"
                data-ocid="navbar.button"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                className="hover:text-primary transition-colors p-1 relative text-foreground"
                aria-label="Cart"
                onClick={() => setCartOpen(true)}
                data-ocid="navbar.button"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                className="p-2 text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                data-ocid="navbar.toggle"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden bg-white border-t border-border"
            >
              <nav className="flex flex-col py-4 px-6 gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    data-ocid="navbar.link"
                    className="text-xs tracking-widest uppercase font-medium text-foreground hover:text-primary transition-colors py-1"
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (link.filter !== null && link.href === "#collection") {
                        e.preventDefault();
                        setActiveFilter(link.filter);
                        scrollTo(collectionRef);
                      } else if (link.href === "#contact") {
                        e.preventDefault();
                        scrollTo(contactRef);
                      }
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: "85vh", minHeight: 480 }}
      >
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url('${BRAND_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-black/45" />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 text-center px-4"
        >
          <p className="text-white/80 tracking-[0.3em] uppercase text-sm mb-4 font-medium">
            Kashmiri Artisanship · Persian Elegance
          </p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8 max-w-4xl mx-auto">
            Elegance Woven in Every Thread
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              type="button"
              onClick={() => scrollTo(collectionRef)}
              className="bg-white text-foreground hover:bg-white/90 rounded-full px-10 py-3.5 text-xs tracking-widest uppercase font-semibold transition-all duration-300 shadow-lg"
              data-ocid="hero.primary_button"
            >
              Shop the Collection
            </button>
            <button
              type="button"
              onClick={() => scrollTo(contactRef)}
              className="border border-white text-white hover:bg-white/15 rounded-full px-10 py-3.5 text-xs tracking-widest uppercase font-medium transition-all duration-300"
              data-ocid="hero.secondary_button"
            >
              Custom Orders
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── COLLECTION ── */}
      <section
        ref={collectionRef}
        id="collection"
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-primary tracking-[0.25em] uppercase text-xs font-medium mb-3">
              Handcrafted Excellence
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Collection
            </h2>
            <div className="w-16 h-0.5 bg-primary mx-auto mb-8" />

            <div className="flex flex-wrap justify-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  data-ocid="collection.tab"
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-6 py-2 rounded-full text-xs tracking-widest uppercase font-medium transition-all duration-200 ${
                    activeFilter === f.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeCategoryKey && (
              <motion.div
                key={activeCategoryKey}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <CategorySlideshow category={activeCategoryKey} />
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            data-ocid="collection.list"
          >
            <AnimatePresence mode="popLayout">
              {displayedProducts.map((product, i) => (
                <motion.article
                  key={`${String(product.id)}-${product.name}`}
                  data-ocid={`collection.item.${i + 1}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-product hover:shadow-product-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden aspect-[4/5]">
                    <img
                      src={product.image || BRAND_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 text-xs tracking-widest uppercase px-3 py-1 rounded-full text-muted-foreground font-medium">
                        {product.category}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="absolute top-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      aria-label="Add to wishlist"
                    >
                      <Heart size={14} className="text-primary" />
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full px-5 text-xs tracking-wide uppercase transition-all duration-200"
                        data-ocid={`collection.item.${i + 1}`}
                        onClick={() => {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                          });
                          toast.success(`${product.name} added to cart!`);
                        }}
                      >
                        <ShoppingCart size={12} className="mr-1" /> Add to Cart
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {displayedProducts.length === 0 && (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="collection.empty_state"
            >
              <p className="font-serif text-lg">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── HERITAGE BAND ── */}
      <section className="relative overflow-hidden" style={{ minHeight: 480 }}>
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url('${BRAND_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex justify-end">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-lg text-right"
          >
            <p className="text-white/70 tracking-[0.25em] uppercase text-xs font-medium mb-4">
              Since 1987
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Our Heritage
            </h2>
            <div className="w-12 h-0.5 bg-white/60 ml-auto mb-6" />
            <p className="text-white/85 text-base leading-relaxed mb-4">
              At The Persian Threads, we blend Kashmiri craftsmanship with
              timeless Persian-inspired elegance. Each piece is handcrafted by
              skilled artisans, preserving centuries-old traditions while
              embracing contemporary fashion.
            </p>
            <p className="text-white/70 text-sm leading-relaxed mb-8">
              From the looms of the Kashmir Valley to homes around the world —
              every thread carries a story of dedication, artistry, and cultural
              pride.
            </p>
            <button
              type="button"
              onClick={() => scrollTo(contactRef)}
              className="border border-white text-white rounded-full px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-white hover:text-foreground transition-all duration-300"
              data-ocid="heritage.button"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section ref={contactRef} id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-primary tracking-[0.25em] uppercase text-xs font-medium mb-3">
              Get in Touch
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Custom Orders & Enquiries
            </h2>
            <div className="w-16 h-0.5 bg-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              We craft bespoke pieces for weddings, special occasions, and
              personal collections.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {contactSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-secondary rounded-2xl"
                data-ocid="contact.success_state"
              >
                <div className="text-4xl mb-4">🧵</div>
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  Thank you!
                </h3>
                <p className="text-muted-foreground mb-6">
                  We've received your message and will get back to you within 24
                  hours.
                </p>
                <button
                  type="button"
                  onClick={() => setContactSuccess(false)}
                  className="text-primary text-sm underline underline-offset-4 hover:no-underline"
                  data-ocid="contact.button"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleContactSubmit}
                className="space-y-5"
                data-ocid="contact.panel"
              >
                <div>
                  <label
                    className="block text-xs tracking-widest uppercase text-muted-foreground mb-2 font-medium"
                    htmlFor="contact-name"
                  >
                    Full Name
                  </label>
                  <Input
                    id="contact-name"
                    required
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    className="rounded-xl border-border focus:border-primary"
                    data-ocid="contact.input"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs tracking-widest uppercase text-muted-foreground mb-2 font-medium"
                    htmlFor="contact-email"
                  >
                    Email Address
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="your@email.com"
                    className="rounded-xl border-border focus:border-primary"
                    data-ocid="contact.input"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs tracking-widest uppercase text-muted-foreground mb-2 font-medium"
                    htmlFor="contact-message"
                  >
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm((f) => ({ ...f, message: e.target.value }))
                    }
                    placeholder="Tell us about your custom order or enquiry…"
                    className="rounded-xl border-border focus:border-primary resize-none"
                    data-ocid="contact.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitContact.isPending}
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground rounded-full py-3 text-sm tracking-widest uppercase font-medium transition-all duration-300"
                  data-ocid="contact.submit_button"
                >
                  {submitContact.isPending ? "Sending…" : "Send Message"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-foreground py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <h4 className="font-serif text-xl font-bold text-white mb-4">
                THE PERSIAN THREADS 🧵
              </h4>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Kashmiri artisanship meets Persian elegance. Every piece tells a
                story.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors"
                  data-ocid="footer.link"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors"
                  data-ocid="footer.link"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors"
                  data-ocid="footer.link"
                >
                  <Twitter size={18} />
                </a>
              </div>
            </div>

            <div>
              <h5 className="text-xs tracking-widest uppercase text-white/40 font-medium mb-4">
                Shop
              </h5>
              <ul className="space-y-2.5 text-sm">
                {["Women", "Men", "Shawls", "New Arrivals", "Sale"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#collection"
                        className="text-white/60 hover:text-white transition-colors"
                        data-ocid="footer.link"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h5 className="text-xs tracking-widest uppercase text-white/40 font-medium mb-4">
                Customer Service
              </h5>
              <ul className="space-y-2.5 text-sm">
                {[
                  "Shipping & Returns",
                  "Size Guide",
                  "Care Instructions",
                  "Custom Orders",
                  "FAQs",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#contact"
                      className="text-white/60 hover:text-white transition-colors"
                      data-ocid="footer.link"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs tracking-widest uppercase text-white/40 font-medium mb-4">
                Contact
              </h5>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li>Lal Chowk, Srinagar</li>
                <li>Kashmir, India 190001</li>
                <li className="pt-1">
                  <a
                    href="mailto:hello@persianthreads.in"
                    className="hover:text-white transition-colors"
                  >
                    hello@persianthreads.in
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+919906099884"
                    className="hover:text-white transition-colors"
                  >
                    +91 9906099884
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <p>
              © {new Date().getFullYear()} The Persian Threads 🧵 · Crafted with
              Heritage &amp; Luxury
            </p>
            <p>
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/70 transition-colors underline underline-offset-2"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const isAdmin = window.location.pathname === "/admin";

  return (
    <>
      <Toaster />
      {isAdmin ? <AdminPanel /> : <StoreFront />}
    </>
  );
}
