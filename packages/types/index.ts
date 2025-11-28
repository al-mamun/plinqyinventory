export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  storeId: number;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface User {
  id: number;
  email: string;
  role: "customer" | "store_owner" | "admin";
}
