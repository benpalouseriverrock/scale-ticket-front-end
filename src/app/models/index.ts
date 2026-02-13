// ============================================================================
// MODELS - Updated with correct weight fields
// ============================================================================

export interface Ticket {
  ticket_id?: number;
  ticket_number?: string;
  date_time?: Date;
  customer_id: number;
  product_id: number;
  truck_id: number;
  trailer_id?: number | null;  // ✅ FIXED: Can be number, null, or undefined
  
  // ✅ FIXED: Split weight entry fields
  truck_weight: number;        // User enters truck weight from scale
  pup_weight: number;          // User enters pup/trailer weight from scale
  gross_weight: number;        // AUTO-CALCULATED: truck_weight + pup_weight
  
  tare_weight?: number;        // Calculated on backend
  net_weight?: number;         // Calculated on backend
  net_tons?: number;           // Calculated on backend
  
  job_name?: string;
  delivered_by?: string;
  delivery_unit?: string;
  delivery_location?: string;
  delivery_method?: string;
  delivery_input_value?: string;
  delivery_charge?: number;
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  cc_fee?: number;
  total?: number;
  
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
  comments?: string;
  
  is_printed?: boolean;
  is_invoice?: boolean;
  haulhub_pushed_at?: Date;
  haulhub_response?: any;
  haulhub_status_code?: number;
  
  loads_today?: number;
  quantity_shipped_today?: number;
}

export interface Customer {
  customer_id: number;
  name: string;
  company?: string;
  contact_first?: string;
  contact_last?: string;
  address_primary?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_zipcode?: string;
  address_billing_2?: string;
  address_billing_3?: string;
  address_billing_4?: string;
  phone?: string;
  email?: string;
  tax_status?: string;
  balance?: number;
  notes?: string;
  active?: boolean;
}

export interface Product {
  product_id: number;
  product_name: string;
  supplier_id?: number;
  price_per_ton: number;
  material_category?: string;
  active?: boolean;
}

export interface Truck {
  truck_id: number;
  unit_number: string;
  tare_weight: number;
  vin?: string;
  license_plate?: string;
  active?: boolean;
}

export interface Trailer {
  trailer_id: number;
  unit_number: string;
  tare_weight: number;
  vin?: string;
  license_plate?: string;
  active?: boolean;
}

export interface DeliveryRate {
  delivery_rate_id: number;
  method: string;
  input_value: string;
  flat_rate?: number;
  rate_per_mile?: number;
  rate_per_ton?: number;
  minimum_charge?: number;
  active: boolean;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  plant_name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

export interface TaxRate {
  tax_rate_id: number;
  state_code: string;
  rate_percentage: number;
  active: boolean;
}
