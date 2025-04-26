export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    pickupAddress: string;
    dropoffAddress: string;
    pickupLocations: string[];      // ✅ مضاف لدعم تعدد مواقع الاستلام
    dropoffLocations: string[];     // ✅ مضاف لدعم تعدد مواقع التوصيل
    packageTypes: string[];         // ✅ مضاف لدعم أنواع الطرود
    status: 'pending' | 'confirmed' | 'delivered' | 'canceled';
    amount: number;
    price: number;                  // ✅ مضاف لدعم السعر الظاهر في الواجهة
    createdAt: Date;
  }
  