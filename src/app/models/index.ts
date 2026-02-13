// src/models/index.ts

export interface Customer {
  customer_id?: number;
  name: string;
  company?: string;
  contact_first?: string;
  contact_last?: string;
  address_primary?: string;
  customer_city?: string;
  customer_state?: string;
  customer_zipcode?: string;
  tax_status?: string;
  phone?: string;
  email?: string;
  balance?: number;
  notes?: string;
}

export interface Product {
  product_id?: number;
  product_name: string;
  supplier_id: number;
  price_per_ton: number;
  material_category?: string;
  mix_id?: string;
  product_code?: string;
  supplier_name?: string;
  active?: boolean;
}

export interface Supplier {
  supplier_id?: number;
  supplier_name: string;
  plant_name?: string;
  contact_info?: string;
  active?: boolean;
}

export interface Truck {
  truck_id?: number;
  unit_number: string;
  configuration?: string;
  tare_weight: number;
  identification_number?: string;
  active?: boolean;
  last_updated?: string;
}

export interface Trailer {
  trailer_id?: number;
  unit_number: string;
  configuration?: string;
  tare_weight: number;
  active?: boolean;
  last_updated?: string;
}

export interface TaxRate {
  tax_rate_id?: number;
  state_code: string;
  location?: string;
  rate_percentage: number;
  description?: string;
  active?: boolean;
}

export interface DeliveryRate {
  delivery_rate_id?: number;
  method: 'location' | 'mileage';
  input_value: string;
  rate_per_mile?: number;
  flat_rate?: number;
  minimum_charge?: number;
  active?: boolean;
}

export interface Ticket {
  ticket_id?: number;
  ticket_number?: string;
  date_time?: string;
  customer_id: number;
  product_id: number;
  truck_id: number;
  trailer_id?: number | null;  // ← FIXED: Allow null
  job_name?: string;
  delivered_by?: string;
  delivery_unit?: string;
  delivery_location?: string;
  gross_weight: number;
  tare_weight?: number;
  net_weight?: number;
  net_tons?: number;
  delivery_charge?: number;
  delivery_method?: 'location' | 'mileage';
  delivery_input_value?: string;
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  cc_fee?: number;
  total?: number;
  is_invoice?: boolean;
  is_printed?: boolean;
  is_wsdot_ticket?: boolean;
  dot_code?: string;
  contract_number?: string;
  job_number?: string;
  mix_id?: string;
  phase_code?: string;
  phase_description?: string;
  dispatch_number?: string;
  purchase_order_number?: string;
  weighmaster?: string;
  loads_today?: number;
  quantity_shipped_today?: number;
  haulhub_pushed_at?: string;
  haulhub_response?: string;
  haulhub_status_code?: number;
  comments?: string;
  customer_name?: string;
  product_name?: string;
  truck_number?: string;
  trailer_number?: string;
}
