import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category } from "../backend";
import { useActor } from "./useActor";

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

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1n,
    name: "Embroidered Pheran",
    price: 3499n,
    category: Category.Women,
    description:
      "Hand-embroidered traditional Kashmiri pheran with intricate floral motifs",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600",
  },
  {
    id: 2n,
    name: "Pashmina Shawl",
    price: 5999n,
    category: Category.Shawls,
    description:
      "Pure pashmina, hand-loomed in Kashmir with centuries-old weaving traditions",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600",
  },
  {
    id: 3n,
    name: "Floral Kurta",
    price: 2499n,
    category: Category.Women,
    description:
      "Delicate floral embroidery on silk-blend fabric with Persian-inspired patterns",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
  },
  {
    id: 4n,
    name: "Silk Pathani",
    price: 4299n,
    category: Category.Men,
    description:
      "Luxurious silk pathani with subtle geometric weave and mandarin collar",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4e51?w=600",
  },
  {
    id: 5n,
    name: "Kani Shawl",
    price: 8999n,
    category: Category.Shawls,
    description:
      "Rare kani weave shawl with elaborate paisley patterns, takes months to craft",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600",
  },
  {
    id: 6n,
    name: "Embroidered Sherwani",
    price: 12499n,
    category: Category.Men,
    description:
      "Royal sherwani with gold zari embroidery, perfect for celebrations",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600",
  },
];

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return FALLBACK_PRODUCTS;
      try {
        const results = await actor.getAllProducts();
        if (!results || results.length === 0) return FALLBACK_PRODUCTS;
        return results as Product[];
      } catch {
        return FALLBACK_PRODUCTS;
      }
    },
    enabled: !isFetching,
    placeholderData: FALLBACK_PRODUCTS,
  });
}

export function useProductsByCategory(category: Category | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", category],
    queryFn: async () => {
      if (!actor || !category) return FALLBACK_PRODUCTS;
      try {
        const results = await actor.getProductsByCategory(category);
        if (!results || results.length === 0)
          return FALLBACK_PRODUCTS.filter((p) => p.category === category);
        return results as Product[];
      } catch {
        return FALLBACK_PRODUCTS.filter((p) => p.category === category);
      }
    },
    enabled: !isFetching && !!category,
    placeholderData: FALLBACK_PRODUCTS,
  });
}

export function useSubmitContact() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      message,
    }: { name: string; email: string; message: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.submitContactForm(name, email, message);
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      product,
    }: { productId: bigint; product: Product }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(productId, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useContactInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<ContactInfo>({
    queryKey: ["contactInfo"],
    queryFn: async () => {
      if (!actor) return { phone: "", email: "", address: "" };
      try {
        return await actor.getContactInfo();
      } catch {
        return { phone: "", email: "", address: "" };
      }
    },
    enabled: !isFetching,
  });
}

export function useSaveContactInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phone,
      email,
      address,
    }: { phone: string; email: string; address: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveContactInfo(phone, email, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactInfo"] });
    },
  });
}
