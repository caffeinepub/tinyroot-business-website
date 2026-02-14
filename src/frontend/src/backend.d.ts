import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Address {
    zip: string;
    street: string;
    city: string;
    addressType?: AddressType;
}
export type Time = bigint;
export interface BagelNutritionalInfo {
    fiber: bigint;
    carbs: bigint;
    calories: bigint;
    protein: bigint;
}
export interface Order {
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    contactInfo: ContactInfo;
    customerPrincipal?: Principal;
    orderDate: Time;
    orderId: bigint;
    specialInstructions?: string;
    totalAmount: bigint;
    customerId: string;
    items: Array<Item>;
}
export interface Item {
    nutritionalInfo?: BagelNutritionalInfo;
    name: string;
    size?: string;
    productId: string;
    dietaryInfo: Array<BagelDietaryInfo>;
    itemType?: ItemType;
    quantity: bigint;
    category?: Category;
    price: bigint;
    ingredients: Array<string>;
}
export type OrderCriteria = {
    __kind__: "paymentStatus";
    paymentStatus: PaymentStatus;
} | {
    __kind__: "pendingOrders";
    pendingOrders: null;
} | {
    __kind__: "city";
    city: string;
} | {
    __kind__: "productId";
    productId: string;
} | {
    __kind__: "specificStatus";
    specificStatus: OrderStatus;
} | {
    __kind__: "minimumAmount";
    minimumAmount: bigint;
} | {
    __kind__: "recentOrders";
    recentOrders: null;
} | {
    __kind__: "customerId";
    customerId: string;
} | {
    __kind__: "dateRange";
    dateRange: [Time, Time];
};
export interface ContactInfo {
    customerName: string;
    billingAddress: Address;
    email: string;
    shippingAddress: Address;
}
export interface UserProfile {
    name: string;
    email: string;
    phone?: string;
}
export enum AddressType {
    shipping = "shipping",
    billing = "billing",
    pickup = "pickup"
}
export enum BagelDietaryInfo {
    vegan = "vegan",
    glutenFree = "glutenFree",
    dairyFree = "dairyFree",
    containsNuts = "containsNuts",
    vegetarian = "vegetarian"
}
export enum Category {
    bagel = "bagel",
    lunchSpecial = "lunchSpecial",
    breakfastSpecial = "breakfastSpecial",
    beverage = "beverage",
    creamCheese = "creamCheese"
}
export enum ItemType {
    premium = "premium",
    classic = "classic",
    stuffed = "stuffed",
    gourmet = "gourmet"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    outForDelivery = "outForDelivery",
    awaitingPickup = "awaitingPickup",
    delivered = "delivered",
    processing = "processing",
    returned = "returned"
}
export enum PaymentStatus {
    disputed = "disputed",
    pending = "pending",
    partiallyRefunded = "partiallyRefunded",
    paid = "paid",
    refunded = "refunded",
    authorized = "authorized",
    chargeback = "chargeback",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(order: Order): Promise<Order>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerOrders(customerId: string): Promise<Array<Order>>;
    getFilteredOrders(filterType: OrderCriteria | null): Promise<Array<Order>>;
    getRazorpayKeyId(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markOrderAsPaid(orderId: bigint): Promise<void>;
    quickSearchOrders(searchTerm: string): Promise<Array<Order>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
