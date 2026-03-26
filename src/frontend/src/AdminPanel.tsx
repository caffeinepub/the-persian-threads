import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ExternalLink,
  Image,
  LogOut,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Category } from "./backend";

const ADMIN_PASSWORD = "admin123";
const SESSION_KEY = "persian_threads_admin_auth";
const PRODUCTS_KEY = "persian_threads_products";
const CONTACT_KEY = "persian_threads_contact";

interface Product {
  id: bigint;
  name: string;
  description: string;
  category: Category;
  price: bigint;
  image: string;
}

interface ContactInfo {
  email: string;
  address: string;
  phone: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1n,
    name: "Embroidered Pheran",
    price: 3499n,
    category: Category.Women,
    description:
      "Hand-embroidered traditional Kashmiri pheran with intricate floral motifs",
    image:
      "/assets/uploads/img_2373-019d298c-eaa8-7709-bdf4-45a070a141e7-1.png",
  },
  {
    id: 2n,
    name: "Pashmina Shawl",
    price: 5999n,
    category: Category.Shawls,
    description:
      "Pure pashmina, hand-loomed in Kashmir with centuries-old weaving traditions",
    image:
      "/assets/uploads/img_2373-019d298c-eaa8-7709-bdf4-45a070a141e7-1.png",
  },
  {
    id: 3n,
    name: "Floral Kurta",
    price: 2499n,
    category: Category.Women,
    description:
      "Delicate floral embroidery on silk-blend fabric with Persian-inspired patterns",
    image:
      "/assets/uploads/img_2373-019d298c-eaa8-7709-bdf4-45a070a141e7-1.png",
  },
  {
    id: 4n,
    name: "Silk Pathani",
    price: 4299n,
    category: Category.Men,
    description:
      "Luxurious silk pathani with subtle geometric weave and mandarin collar",
    image:
      "/assets/uploads/img_2373-019d298c-eaa8-7709-bdf4-45a070a141e7-1.png",
  },
  {
    id: 5n,
    name: "Kani Shawl",
    price: 8999n,
    category: Category.Shawls,
    description:
      "Rare kani weave shawl with elaborate paisley patterns, takes months to craft",
    image:
      "/assets/uploads/img_2373-019d298c-eaa8-7709-bdf4-45a070a141e7-1.png",
  },
  {
    id: 6n,
    name: "Embroidered Sherwani",
    price: 12499n,
    category: Category.Men,
    description:
      "Royal sherwani with gold zari embroidery, perfect for celebrations",
    image:
      "/assets/uploads/img_2373-019d298c-eaa8-7709-bdf4-45a070a141e7-1.png",
  },
];

const DEFAULT_CONTACT: ContactInfo = {
  phone: "9906099884",
  email: "persianThreads@gmail.com",
  address: "Dal Lake Road, Srinagar, Kashmir",
};

function serializeProducts(products: Product[]): string {
  return JSON.stringify(
    products.map((p) => ({
      ...p,
      id: p.id.toString(),
      price: p.price.toString(),
    })),
  );
}

function deserializeProducts(json: string): Product[] {
  try {
    const arr = JSON.parse(json);
    return arr.map((p: Record<string, unknown>) => ({
      ...p,
      id: BigInt(p.id as string),
      price: BigInt(p.price as string),
    }));
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return DEFAULT_PRODUCTS;
    const parsed = deserializeProducts(raw);
    return parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

function persistProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, serializeProducts(products));
}

function loadContact(): ContactInfo {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    if (!raw) return DEFAULT_CONTACT;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CONTACT;
  }
}

function persistContact(contact: ContactInfo): void {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
}

function formatPrice(price: bigint): string {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

// ── Login Gate ─────────────────────────────────────────────────────────────
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">🧵</div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            The Persian Threads
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-ocid="admin.panel"
        >
          <div>
            <Label
              htmlFor="admin-password"
              className="text-xs tracking-widest uppercase text-muted-foreground font-medium"
            >
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter admin password"
              className="mt-1.5 rounded-xl"
              autoFocus
              data-ocid="admin.input"
            />
            {error && (
              <p
                className="text-destructive text-xs mt-1.5"
                data-ocid="admin.error_state"
              >
                Incorrect password. Please try again.
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground rounded-full text-sm tracking-widest uppercase font-medium"
            data-ocid="admin.submit_button"
          >
            Sign In
          </Button>
        </form>
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
            data-ocid="admin.link"
          >
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Product Form ────────────────────────────────────────────────────────────
interface ProductFormData {
  name: string;
  price: string;
  category: Category;
  description: string;
  image: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  price: "",
  category: Category.Women,
  description: "",
  image: "",
};

function ProductFormDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialData: ProductFormData;
  onSave: (data: ProductFormData) => void;
  title: string;
}) {
  const [form, setForm] = useState<ProductFormData>(initialData);

  const handleOpenChange = (v: boolean) => {
    if (v) setForm(initialData);
    onOpenChange(v);
  };

  function field(key: keyof ProductFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg" data-ocid="admin.dialog">
        <DialogHeader>
          <DialogTitle className="font-serif">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
              Product Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
              placeholder="e.g. Embroidered Pheran"
              className="mt-1.5 rounded-xl"
              data-ocid="admin.input"
            />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
              Price (₹)
            </Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => field("price", e.target.value)}
              placeholder="e.g. 3499"
              className="mt-1.5 rounded-xl"
              data-ocid="admin.input"
            />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
              Category
            </Label>
            <Select
              value={form.category}
              onValueChange={(v) => field("category", v as Category)}
            >
              <SelectTrigger
                className="mt-1.5 rounded-xl"
                data-ocid="admin.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Category.Women}>Women</SelectItem>
                <SelectItem value={Category.Men}>Men</SelectItem>
                <SelectItem value={Category.Shawls}>Shawls</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder="Brief product description…"
              rows={3}
              className="mt-1.5 rounded-xl resize-none"
              data-ocid="admin.textarea"
            />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
              Image URL
            </Label>
            <Input
              value={form.image}
              onChange={(e) => field("image", e.target.value)}
              placeholder="https://… or /assets/…"
              className="mt-1.5 rounded-xl"
              data-ocid="admin.input"
            />
            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="mt-2 h-24 w-24 object-cover rounded-lg border border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={!form.name || !form.price}
            className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full"
            data-ocid="admin.save_button"
          >
            Save Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirm Dialog ───────────────────────────────────────────────────
function DeleteDialog({
  open,
  onOpenChange,
  productName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-ocid="admin.dialog">
        <DialogHeader>
          <DialogTitle className="font-serif">Delete Product?</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Are you sure you want to delete <strong>{productName}</strong>? This
          action cannot be undone.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="rounded-full"
            data-ocid="admin.confirm_button"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Category Images Section ─────────────────────────────────────────────────
const CATEGORY_KEYS: { label: string; key: string }[] = [
  { label: "Women", key: "Women" },
  { label: "Men", key: "Men" },
  { label: "Shawls", key: "Shawls" },
];

function CategoryImagesSection() {
  const [images, setImages] = useState<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};
    for (const { key } of CATEGORY_KEYS) {
      try {
        const raw = localStorage.getItem(`persian_category_images_${key}`);
        result[key] = raw ? JSON.parse(raw) : [];
      } catch {
        result[key] = [];
      }
    }
    return result;
  });

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function persistCategoryImages(key: string, imgs: string[]) {
    localStorage.setItem(
      `persian_category_images_${key}`,
      JSON.stringify(imgs),
    );
    // Notify other tabs/components
    window.dispatchEvent(new Event("storage"));
  }

  function handleUpload(key: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    );
    Promise.all(readers).then((newImgs) => {
      setImages((prev) => {
        const updated = [...(prev[key] || []), ...newImgs];
        persistCategoryImages(key, updated);
        return { ...prev, [key]: updated };
      });
      toast.success(`${newImgs.length} image(s) uploaded for ${key}!`);
    });
  }

  function handleRemove(key: string, idx: number) {
    setImages((prev) => {
      const updated = prev[key].filter((_, i) => i !== idx);
      persistCategoryImages(key, updated);
      return { ...prev, [key]: updated };
    });
    toast.success("Image removed.");
  }

  function handleClearAll(key: string) {
    setImages((prev) => {
      persistCategoryImages(key, []);
      return { ...prev, [key]: [] };
    });
    toast.success(`All images cleared for ${key}.`);
  }

  return (
    <section data-ocid="admin.panel">
      <div className="flex items-center gap-3 mb-6">
        <Image size={20} className="text-primary" />
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Category Images
        </h2>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Upload slideshow images for each category. These appear above the
        product grid when a category filter is selected.
      </p>

      <div className="space-y-8">
        {CATEGORY_KEYS.map(({ label, key }) => (
          <div
            key={key}
            className="bg-white rounded-2xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {label} Images
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {(images[key] || []).length} images
                </Badge>
                {(images[key] || []).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClearAll(key)}
                    className="rounded-full text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                    data-ocid="admin.delete_button"
                  >
                    <Trash2 size={12} className="mr-1" /> Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {(images[key] || []).length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {(images[key] || []).map((src, idx) => (
                  <div
                    key={src.slice(0, 30)}
                    className="relative group"
                    data-ocid={`admin.item.${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`${label} ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-xl border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(key, idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      aria-label="Remove image"
                      data-ocid={`admin.delete_button.${idx + 1}`}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(images[key] || []).length === 0 && (
              <div className="flex items-center justify-center h-20 bg-secondary rounded-xl mb-4 border border-dashed border-border">
                <p className="text-muted-foreground text-sm">
                  No images yet. Upload some below.
                </p>
              </div>
            )}

            {/* Upload */}
            <div className="flex items-center gap-3">
              <input
                ref={(el) => {
                  fileInputRefs.current[key] = el;
                }}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(key, e.target.files)}
                data-ocid="admin.upload_button"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current[key]?.click()}
                className="rounded-full text-xs"
                data-ocid="admin.upload_button"
              >
                <Plus size={14} className="mr-1.5" /> Upload Images
              </Button>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WEBP · Multiple files supported
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Main Admin Panel ────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [contactInfo, setContactInfo] = useState<ContactInfo>(() =>
    loadContact(),
  );

  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function handleAddProduct(data: ProductFormData) {
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0n);
    const newProduct: Product = {
      id: maxId + 1n,
      name: data.name,
      price: BigInt(Math.round(Number(data.price))),
      category: data.category,
      description: data.description,
      image: data.image,
    };
    const updated = [...products, newProduct];
    persistProducts(updated);
    setProducts(updated);
    setAddOpen(false);
    toast.success(`"${data.name}" added successfully!`);
  }

  function handleUpdateProduct(data: ProductFormData) {
    if (!editProduct) return;
    const updated = products.map((p) =>
      p.id === editProduct.id
        ? {
            ...editProduct,
            name: data.name,
            price: BigInt(Math.round(Number(data.price))),
            category: data.category,
            description: data.description,
            image: data.image,
          }
        : p,
    );
    persistProducts(updated);
    setProducts(updated);
    setEditProduct(null);
    toast.success(`"${data.name}" updated successfully!`);
  }

  function handleDeleteProduct() {
    if (!deleteTarget) return;
    const updated = products.filter((p) => p.id !== deleteTarget.id);
    persistProducts(updated);
    setProducts(updated);
    toast.success(`"${deleteTarget.name}" deleted.`);
    setDeleteTarget(null);
  }

  function handleSaveContact(e: React.FormEvent) {
    e.preventDefault();
    persistContact(contactInfo);
    toast.success("Contact info saved!");
  }

  const whatsappPhone = contactInfo.phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=Hello! I'm interested in your products.`;

  const editFormData: ProductFormData = editProduct
    ? {
        name: editProduct.name,
        price: String(Number(editProduct.price)),
        category: editProduct.category,
        description: editProduct.description,
        image: editProduct.image,
      }
    : EMPTY_FORM;

  const categoryColor: Record<Category, string> = {
    [Category.Women]: "bg-pink-50 text-pink-700 border-pink-200",
    [Category.Men]: "bg-blue-50 text-blue-700 border-blue-200",
    [Category.Shawls]: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold text-primary">
              🧵 Admin Dashboard
            </span>
            <span className="text-muted-foreground text-xs hidden sm:block">
              The Persian Threads
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              data-ocid="admin.link"
            >
              <ArrowLeft size={14} /> Back to Store
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="rounded-full text-xs"
              data-ocid="admin.secondary_button"
            >
              <LogOut size={14} className="mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* ── Products Section ── */}
        <section data-ocid="admin.panel">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package size={20} className="text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Products
              </h2>
              <Badge variant="secondary" className="rounded-full">
                {products.length}
              </Badge>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full text-sm"
              data-ocid="admin.primary_button"
            >
              <Plus size={16} className="mr-1.5" /> Add Product
            </Button>
          </div>

          {products.length === 0 ? (
            <div
              className="text-center py-16 bg-white rounded-2xl border border-dashed border-border"
              data-ocid="admin.empty_state"
            >
              <Package
                size={32}
                className="mx-auto text-muted-foreground/40 mb-3"
              />
              <p className="text-muted-foreground font-serif">
                No products yet. Add your first one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" data-ocid="admin.list">
              {products.map((product, i) => (
                <div
                  key={String(product.id)}
                  className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4"
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/assets/uploads/img_2373-019d298c-eaa8-7709-bdf4-45a070a141e7-1.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-semibold text-foreground truncate">
                        {product.name}
                      </h3>
                      <span
                        className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border font-medium ${
                          categoryColor[product.category]
                        }`}
                      >
                        {product.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5 truncate">
                      {product.description}
                    </p>
                    <p className="font-serif font-bold text-primary mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditProduct(product)}
                      className="rounded-full text-xs"
                      data-ocid={`admin.edit_button.${i + 1}`}
                    >
                      <Pencil size={12} className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteTarget(product)}
                      className="rounded-full text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                      data-ocid={`admin.delete_button.${i + 1}`}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* ── Category Images Section ── */}
        <CategoryImagesSection />

        <Separator />

        {/* ── Contact Info Section ── */}
        <section data-ocid="admin.panel">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare size={20} className="text-primary" />
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Contact Info
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
                  Phone Number
                </Label>
                <Input
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo((c) => ({ ...c, phone: e.target.value }))
                  }
                  placeholder="e.g. 9906099884"
                  className="mt-1.5 rounded-xl"
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
                  Email
                </Label>
                <Input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo((c) => ({ ...c, email: e.target.value }))
                  }
                  placeholder="contact@example.com"
                  className="mt-1.5 rounded-xl"
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
                  Address
                </Label>
                <Input
                  value={contactInfo.address}
                  onChange={(e) =>
                    setContactInfo((c) => ({ ...c, address: e.target.value }))
                  }
                  placeholder="e.g. Dal Lake Road, Srinagar"
                  className="mt-1.5 rounded-xl"
                  data-ocid="admin.input"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full text-sm"
                  data-ocid="admin.save_button"
                >
                  Save Contact Info
                </Button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  data-ocid="admin.link"
                >
                  <ExternalLink size={12} /> Preview WhatsApp link
                </a>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Dialogs */}
      <ProductFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initialData={EMPTY_FORM}
        onSave={handleAddProduct}
        title="Add New Product"
      />
      <ProductFormDialog
        open={!!editProduct}
        onOpenChange={(v) => !v && setEditProduct(null)}
        initialData={editFormData}
        onSave={handleUpdateProduct}
        title="Edit Product"
      />
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        productName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "1",
  );

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }

  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
}
