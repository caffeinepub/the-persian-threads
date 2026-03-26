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
  Loader2,
  LogOut,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Category } from "./backend";
import {
  type Product,
  useAddProduct,
  useContactInfo,
  useDeleteProduct,
  useProducts,
  useSaveContactInfo,
  useUpdateProduct,
} from "./hooks/useQueries";

const ADMIN_PASSWORD = "admin123";
const SESSION_KEY = "persian_threads_admin_auth";

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
  isPending,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialData: ProductFormData;
  onSave: (data: ProductFormData) => void;
  isPending: boolean;
  title: string;
}) {
  const [form, setForm] = useState<ProductFormData>(initialData);

  // Reset when dialog opens with new data
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
            <Label
              htmlFor="pf-name"
              className="text-xs uppercase tracking-widest text-muted-foreground font-medium"
            >
              Product Name
            </Label>
            <Input
              id="pf-name"
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
              placeholder="e.g. Embroidered Pheran"
              className="mt-1.5 rounded-xl"
              data-ocid="admin.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="pf-price"
                className="text-xs uppercase tracking-widest text-muted-foreground font-medium"
              >
                Price (₹)
              </Label>
              <Input
                id="pf-price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => field("price", e.target.value)}
                placeholder="3499"
                className="mt-1.5 rounded-xl"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
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
          </div>
          <div>
            <Label
              htmlFor="pf-desc"
              className="text-xs uppercase tracking-widest text-muted-foreground font-medium"
            >
              Description
            </Label>
            <Textarea
              id="pf-desc"
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder="Describe this product…"
              rows={3}
              className="mt-1.5 rounded-xl resize-none"
              data-ocid="admin.textarea"
            />
          </div>
          <div>
            <Label
              htmlFor="pf-image"
              className="text-xs uppercase tracking-widest text-muted-foreground font-medium"
            >
              Image URL
            </Label>
            <Input
              id="pf-image"
              value={form.image}
              onChange={(e) => field("image", e.target.value)}
              placeholder="https://…"
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
            disabled={isPending || !form.name || !form.price}
            className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full"
            data-ocid="admin.save_button"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isPending ? "Saving…" : "Save Product"}
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
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName: string;
  onConfirm: () => void;
  isPending: boolean;
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
            disabled={isPending}
            className="rounded-full"
            data-ocid="admin.confirm_button"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Admin Panel ────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: contactInfo } = useContactInfo();

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const saveContactInfo = useSaveContactInfo();

  // Product dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Contact form state
  const [contact, setContact] = useState({ phone: "", email: "", address: "" });
  const [contactLoaded, setContactLoaded] = useState(false);

  // Sync contact info when loaded
  if (contactInfo && !contactLoaded) {
    setContact({
      phone: contactInfo.phone,
      email: contactInfo.email,
      address: contactInfo.address,
    });
    setContactLoaded(true);
  }

  async function handleAddProduct(data: ProductFormData) {
    try {
      const product: Product = {
        id: BigInt(Date.now()),
        name: data.name,
        price: BigInt(Math.round(Number(data.price))),
        category: data.category,
        description: data.description,
        image: data.image,
      };
      await addProduct.mutateAsync(product);
      setAddOpen(false);
      toast.success(`"${data.name}" added successfully!`);
    } catch {
      toast.error("Failed to add product.");
    }
  }

  async function handleUpdateProduct(data: ProductFormData) {
    if (!editProduct) return;
    try {
      const updated: Product = {
        ...editProduct,
        name: data.name,
        price: BigInt(Math.round(Number(data.price))),
        category: data.category,
        description: data.description,
        image: data.image,
      };
      await updateProduct.mutateAsync({
        productId: editProduct.id,
        product: updated,
      });
      setEditProduct(null);
      toast.success(`"${data.name}" updated successfully!`);
    } catch {
      toast.error("Failed to update product.");
    }
  }

  async function handleDeleteProduct() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast.success(`"${deleteTarget.name}" deleted.`);
    } catch {
      toast.error("Failed to delete product.");
    }
  }

  async function handleSaveContact(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveContactInfo.mutateAsync(contact);
      toast.success("Contact info saved!");
    } catch {
      toast.error("Failed to save contact info.");
    }
  }

  const whatsappPhone = contact.phone.replace(/\D/g, "");
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

          {productsLoading ? (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="admin.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
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
                  className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors"
                  data-ocid={`admin.item.${i + 1}`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <img
                      src={
                        product.image ||
                        "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-serif font-semibold text-foreground truncate">
                        {product.name}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${categoryColor[product.category]}`}
                      >
                        {product.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs line-clamp-1">
                      {product.description}
                    </p>
                    <p className="text-primary font-serif font-bold mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => setEditProduct(product)}
                      data-ocid={`admin.edit_button.${i + 1}`}
                    >
                      <Pencil size={13} className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => setDeleteTarget(product)}
                      data-ocid={`admin.delete_button.${i + 1}`}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* ── Contact Info Section ── */}
        <section data-ocid="admin.panel">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare size={20} className="text-primary" />
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Store Contact Info
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-border p-6 max-w-xl">
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <Label
                  htmlFor="ci-phone"
                  className="text-xs uppercase tracking-widest text-muted-foreground font-medium"
                >
                  Phone
                </Label>
                <Input
                  id="ci-phone"
                  type="tel"
                  value={contact.phone}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, phone: e.target.value }))
                  }
                  placeholder="+91 123 456 7890"
                  className="mt-1.5 rounded-xl"
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="ci-email"
                  className="text-xs uppercase tracking-widest text-muted-foreground font-medium"
                >
                  Email
                </Label>
                <Input
                  id="ci-email"
                  type="email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, email: e.target.value }))
                  }
                  placeholder="hello@persianthreads.in"
                  className="mt-1.5 rounded-xl"
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="ci-address"
                  className="text-xs uppercase tracking-widest text-muted-foreground font-medium"
                >
                  Address
                </Label>
                <Textarea
                  id="ci-address"
                  value={contact.address}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, address: e.target.value }))
                  }
                  placeholder="Lal Chowk, Srinagar, Kashmir 190001"
                  rows={2}
                  className="mt-1.5 rounded-xl resize-none"
                  data-ocid="admin.textarea"
                />
              </div>

              {/* WhatsApp preview */}
              {whatsappPhone && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-green-700 uppercase tracking-widest">
                      WhatsApp Link Preview
                    </p>
                    <p className="text-xs text-green-600 mt-0.5 break-all">
                      {whatsappUrl}
                    </p>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-green-600 hover:text-green-700"
                    data-ocid="admin.link"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}

              <Button
                type="submit"
                disabled={saveContactInfo.isPending}
                className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full text-sm tracking-widest uppercase font-medium"
                data-ocid="admin.save_button"
              >
                {saveContactInfo.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {saveContactInfo.isPending ? "Saving…" : "Save Contact Info"}
              </Button>
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
        isPending={addProduct.isPending}
        title="Add New Product"
      />

      <ProductFormDialog
        open={!!editProduct}
        onOpenChange={(v) => {
          if (!v) setEditProduct(null);
        }}
        initialData={editFormData}
        onSave={handleUpdateProduct}
        isPending={updateProduct.isPending}
        title="Edit Product"
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        productName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteProduct}
        isPending={deleteProduct.isPending}
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
