export interface User {
    username: string;
  }
  
  export interface Order {
    id: string;
    username: string;
    pickupLocations: string[];
    dropoffLocations: string[];
    packageTypes: string[];
    status: string;
    price: number;
    paymentIntentId?: string;
  }