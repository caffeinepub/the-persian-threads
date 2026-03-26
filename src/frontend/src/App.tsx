import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  Facebook,
  Heart,
  Instagram,
  Menu,
  Search,
  ShoppingCart,
  Twitter,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
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

function formatPrice(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function StoreFront() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);
  const [cartCount, setCartCount] = useState(0);
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

  return (
    <div className="min-h-screen bg-secondary">
      {/* ── NAVBAR ── */}
      <header
        className="sticky top-0 z-50 bg-white border-b border-border shadow-xs"
        data-ocid="navbar.panel"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand */}
            <a
              href="/"
              className="font-serif text-xl md:text-2xl font-bold text-primary tracking-wider"
              data-ocid="navbar.link"
            >
              THE PERSIAN THREADS 🧵
            </a>

            {/* Desktop nav */}
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

            {/* Icons */}
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
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="lg:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              data-ocid="navbar.toggle"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
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
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1600')",
          }}
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
            <Button
              onClick={() => scrollTo(collectionRef)}
              className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full px-10 py-3 text-sm tracking-widest uppercase font-medium transition-all duration-300 hover:shadow-lg"
              data-ocid="hero.primary_button"
            >
              Shop Collection
            </Button>
            <button
              type="button"
              onClick={() => scrollTo(collectionRef)}
              className="text-white border border-white/60 rounded-full px-8 py-3 text-sm tracking-widest uppercase hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
              data-ocid="hero.secondary_button"
            >
              Explore <ChevronDown size={14} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURED COLLECTION ── */}
      <section
        ref={collectionRef}
        id="collection"
        className="py-20 px-4 bg-white"
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
              Handcrafted with Love
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
              Featured Collection
            </h2>
            <div className="w-16 h-0.5 bg-primary mx-auto mb-8" />

            {/* Category filters */}
            <div
              className="flex flex-wrap justify-center gap-3 mb-2"
              data-ocid="collection.panel"
            >
              {[
                { label: "All", value: null },
                { label: "Women", value: Category.Women },
                { label: "Men", value: Category.Men },
                { label: "Shawls", value: Category.Shawls },
              ].map((f) => (
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

          {/* Product grid */}
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
                      src={
                        product.image ||
                        "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600"
                      }
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
                          setCartCount((c) => c + 1);
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
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600')",
          }}
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
      <footer className="bg-footer text-footer-foreground py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* About */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-serif text-lg font-bold text-white mb-4">
                The Persian Threads 🧵
              </h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Handcrafted Kashmiri and Persian-inspired clothing. Every thread
                carries a legacy of artisanship and cultural pride.
              </p>
              <div className="flex gap-4 mt-6">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-white/50 hover:text-white transition-colors"
                  data-ocid="footer.link"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-white/50 hover:text-white transition-colors"
                  data-ocid="footer.link"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="text-white/50 hover:text-white transition-colors"
                  data-ocid="footer.link"
                >
                  <Twitter size={18} />
                </a>
              </div>
            </div>

            {/* Shop */}
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

            {/* Customer Service */}
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

            {/* Contact */}
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
                    href="tel:+911234567890"
                    className="hover:text-white transition-colors"
                  >
                    +91 123 456 7890
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
              Built with ❤️ using{" "}
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
