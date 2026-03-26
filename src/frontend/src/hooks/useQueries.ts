import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category } from "../backend";

export interface Product {
  id: bigint;
  name: string;
  description: string;
  category: Category;
  price: bigint;
  image: string;
}

export interface ContactInfo {
  email: string;
  address: string;
  phone: string;
}

const PRODUCTS_KEY = "persian_threads_products";
const CONTACT_KEY = "persian_threads_contact";

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

// Serialize bigint for JSON
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

function saveProducts(products: Product[]): void {
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

function saveContact(contact: ContactInfo): void {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: loadProducts,
    staleTime: 0,
  });
}

export function useProductsByCategory(category: Category | null) {
  return useQuery<Product[]>({
    queryKey: ["products", category],
    queryFn: () => {
      const all = loadProducts();
      if (!category) return all;
      return all.filter((p) => p.category === category);
    },
    enabled: !!category,
    staleTime: 0,
  });
}

export function useContactInfo() {
  return useQuery<ContactInfo>({
    queryKey: ["contactInfo"],
    queryFn: loadContact,
    staleTime: 0,
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      const products = loadProducts();
      const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0n);
      const newProduct = { ...product, id: maxId + 1n };
      saveProducts([...products, newProduct]);
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      product,
    }: { productId: bigint; product: Product }) => {
      const products = loadProducts();
      const updated = products.map((p) =>
        p.id === productId ? { ...product, id: productId } : p,
      );
      saveProducts(updated);
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      const products = loadProducts();
      saveProducts(products.filter((p) => p.id !== productId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useSaveContactInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phone,
      email,
      address,
    }: { phone: string; email: string; address: string }) => {
      saveContact({ phone, email, address });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactInfo"] });
    },
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: async ({
      name,
      email,
      message,
    }: { name: string; email: string; message: string }) => {
      // Store contact form submissions in localStorage
      const key = "persian_threads_messages";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({ name, email, message, time: Date.now() });
      localStorage.setItem(key, JSON.stringify(existing));
    },
  });
}
