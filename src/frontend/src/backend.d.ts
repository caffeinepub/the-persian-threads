import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ContactInfo {
    email: string;
    address: string;
    phone: string;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    category: Category;
    image: string;
    price: bigint;
}
export enum Category {
    Men = "Men",
    Shawls = "Shawls",
    Women = "Women"
}
export interface backendInterface {
    addProduct(product: Product): Promise<Product>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getContactInfo(): Promise<ContactInfo>;
    getProduct(productId: bigint): Promise<Product>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getProductsByPrice(): Promise<Array<Product>>;
    removeProductsEmptyEntries(): Promise<void>;
    saveContactInfo(phone: string, email: string, address: string): Promise<void>;
    submitContactForm(name: string, email: string, message: string): Promise<void>;
    updateProduct(productId: bigint, product: Product): Promise<Product>;
}
