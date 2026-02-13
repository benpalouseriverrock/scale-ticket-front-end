import { Component, OnInit } from '@angular/core';
import { Ticket, Customer, Product, Truck, Trailer, DeliveryRate } from '../models/index';
import { TicketService } from '../services/ticket.service';
import { CustomerService } from '../services/customer.service';
import { ProductService } from '../services/product.service';
import { TruckService } from '../services/truck.service';
import { TrailerService } from '../services/trailer.service';
import { DeliveryRateService } from '../services/delivery-rate.service';

@Component({
  selector: 'app-ticket-entry',
  templateUrl: './ticket-entry.component.html',
  styleUrls: ['./ticket-entry.component.css']
})
export class TicketEntryComponent implements OnInit {
  
  // Form Data
  ticket: Ticket = {
    customer_id: 0,
    product_id: 0,
    truck_id: 0,
    trailer_id: undefined,
    truck_weight: 0,        // ✅ FIXED: User enters truck weight
    pup_weight: 0,          // ✅ FIXED: User enters pup/trailer weight
    gross_weight: 0,        // ✅ FIXED: AUTO-CALCULATED (truck + pup)
    delivery_method: 'location',
    delivery_input_value: '',
    job_name: '',
    delivered_by: '',
    delivery_location: '',
    cc_fee: 0,
    is_wsdot_ticket: false,
    dot_code: '',
    job_number: '',
    contract_number: '',
    comments: ''
  };

  // Dropdown Data
  customers: Customer[] = [];
  products: Product[] = [];
  trucks: Truck[] = [];
  trailers: Trailer[] = [];
  deliveryRates: DeliveryRate[] = [];

  // Selected Items (for display)
  selectedCustomer: Customer | null = null;
  selectedProduct: Product | null = null;
  selectedTruck: Truck | null = null;
  selectedTrailer: Trailer | null = null;

  // Calculated Values Display
  calculatedValues = {
    tare: 0,
    netWeight: 0,
    netTons: 0,
    deliveryUnit: '',
    materialCost: 0,
    deliveryCharge: 0,
    subtotal: 0,
    taxRate: 8.5,
    taxAmount: 0,
    total: 0
  };

  // UI State
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private ticketService: TicketService,
    private customerService: CustomerService,
    private productService: ProductService,
    private truckService: TruckService,
    private trailerService: TrailerService,
    private deliveryRateService: DeliveryRateService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
    this.loadTrucks();
    this.loadTrailers();
    this.loadDeliveryRates();
  }

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  loadCustomers() {
    this.customerService.getAll().subscribe({
      next: (data) => { this.customers = data; },
      error: (err) => { this.errorMessage = 'Failed to load customers'; }
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: (data) => { this.products = data; },
      error: (err) => { this.errorMessage = 'Failed to load products'; }
    });
  }

  loadTrucks() {
    this.truckService.getAll().subscribe({
      next: (data) => { this.trucks = data; },
      error: (err) => { this.errorMessage = 'Failed to load trucks'; }
    });
  }

  loadTrailers() {
    this.trailerService.getAll().subscribe({
      next: (data) => { this.trailers = data; },
      error: (err) => { this.errorMessage = 'Failed to load trailers'; }
    });
  }

  loadDeliveryRates() {
    this.deliveryRateService.getAll().subscribe({
      next: (data) => { this.deliveryRates = data; },
      error: (err) => { this.errorMessage = 'Failed to load delivery rates'; }
    });
  }

  // ============================================================================
  // SELECTION CHANGE HANDLERS
  // ============================================================================

  onCustomerChange() {
    const customerId = Number(this.ticket.customer_id);
    const customer = this.customers.find(c => c.customer_id === customerId);
    this.selectedCustomer = customer || null;
    
    if (customer) {
      this.calculatedValues.taxRate = this.getTaxRateForState(customer.customer_state);
    }
    
    this.calculateAll();
  }

  onProductChange() {
    const productId = Number(this.ticket.product_id);
    const product = this.products.find(p => p.product_id === productId);
    this.selectedProduct = product || null;
    this.calculateAll();
  }

  onTruckChange() {
    const truckId = Number(this.ticket.truck_id);
    const truck = this.trucks.find(t => t.truck_id === truckId);
    this.selectedTruck = truck || null;
    this.updateDeliveryUnit();
    this.calculateAll();
  }

  onTrailerChange() {
    const trailerId = this.ticket.trailer_id ? Number(this.ticket.trailer_id) : null;
    const trailer = trailerId ? this.trailers.find(t => t.trailer_id === trailerId) : null;
    this.selectedTrailer = trailer || null;
    this.updateDeliveryUnit();
    this.calculateAll();
  }

  // ============================================================================
  // ✅ WEIGHT CALCULATIONS - FIXED TO MATCH CLIENT REQUIREMENTS
  // ============================================================================

  onTruckWeightChange() {
    // When user enters truck weight, recalculate gross and everything else
    this.calculateGrossWeight();
    this.calculateAll();
  }

  onPupWeightChange() {
    // When user enters pup weight, recalculate gross and everything else
    this.calculateGrossWeight();
    this.calculateAll();
  }

  calculateGrossWeight() {
    // ✅ STEP 1: Calculate GROSS WEIGHT = Truck Weight + Pup Weight
    const truckWeight = Number(this.ticket.truck_weight) || 0;
    const pupWeight = Number(this.ticket.pup_weight) || 0;
    this.ticket.gross_weight = truckWeight + pupWeight;

    console.log('Gross Weight Calculation:', {
      truckWeight,
      pupWeight,
      grossWeight: this.ticket.gross_weight
    });
  }

  updateDeliveryUnit() {
    if (this.selectedTruck) {
      this.calculatedValues.deliveryUnit = this.selectedTruck.unit_number;
      if (this.selectedTrailer) {
        this.calculatedValues.deliveryUnit += ` with ${this.selectedTrailer.unit_number}`;
      }
      this.ticket.delivery_unit = this.calculatedValues.deliveryUnit;
    }
  }

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  calculateAll() {
    // Early return if required fields are missing
    if (!this.selectedProduct || !this.selectedTruck) {
      console.log('Cannot calculate - missing product or truck:', {
        hasProduct: !!this.selectedProduct,
        hasTruck: !!this.selectedTruck
      });
      return;
    }

    // ✅ STEP 1: Calculate Tare (truck tare + trailer tare)
    const truckTare = Number(this.selectedTruck.tare_weight) || 0;
    const trailerTare = Number(this.selectedTrailer?.tare_weight) || 0;
    this.calculatedValues.tare = truckTare + trailerTare;

    // ✅ STEP 2: Calculate Net Weight = Gross Weight - Tare Weight
    const grossWeight = Number(this.ticket.gross_weight) || 0;
    this.calculatedValues.netWeight = grossWeight - this.calculatedValues.tare;
    this.calculatedValues.netTons = this.calculatedValues.netWeight / 2000;

    // Debug logging
    console.log('Weight Calculations:', {
      truckWeight: this.ticket.truck_weight,
      pupWeight: this.ticket.pup_weight,
      grossWeight: this.ticket.gross_weight,
      truckTare,
      trailerTare,
      totalTare: this.calculatedValues.tare,
      netWeight: this.calculatedValues.netWeight,
      netTons: this.calculatedValues.netTons
    });

    // 3. Calculate Material Cost
    const pricePerTon = Number(this.selectedProduct.price_per_ton) || 0;
    this.calculatedValues.materialCost = this.calculatedValues.netTons * pricePerTon;

    // 4. Estimate Delivery Charge
    this.calculatedValues.deliveryCharge = this.estimateDeliveryCharge();

    // 5. Calculate Subtotal
    this.calculatedValues.subtotal = this.calculatedValues.materialCost + this.calculatedValues.deliveryCharge;

    // 6. Calculate Tax
    this.calculatedValues.taxAmount = this.calculatedValues.subtotal * (this.calculatedValues.taxRate / 100);

    // 7. Calculate Total
    const ccFee = Number(this.ticket.cc_fee) || 0;
    this.calculatedValues.total = this.calculatedValues.subtotal + this.calculatedValues.taxAmount + ccFee;

    console.log('Final Calculations:', this.calculatedValues);
  }

  estimateDeliveryCharge(): number {
    if (!this.ticket.delivery_method || !this.ticket.delivery_input_value) {
      return 0;
    }

    console.log('Estimating delivery charge:', {
      method: this.ticket.delivery_method,
      input: this.ticket.delivery_input_value,
      availableRates: this.deliveryRates
    });

    const rate = this.deliveryRates.find(r => 
      r.method === this.ticket.delivery_method && 
      r.input_value === this.ticket.delivery_input_value &&
      r.active
    );

    console.log('Found rate:', rate);
    if (!rate) {
      console.log('No matching rate found');
      return 0;
    }

    if (this.ticket.delivery_method === 'location') {
      return Number(rate.flat_rate) || 0;
    } else if (this.ticket.delivery_method === 'mileage') {
      const miles = Number(this.ticket.delivery_input_value) || 0;
      return (Number(rate.rate_per_mile) || 0) * miles;
    }

    return 0;
  }

  getTaxRateForState(state?: string): number {
    if (!state) return 8.5;
    if (state === 'ID') return 6.0;
    if (state === 'WA') return 7.9;
    return 8.5; // Default
  }

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare ticket data for submission
    const ticketData = {
      ...this.ticket,
      delivery_unit: this.calculatedValues.deliveryUnit
    };

    this.ticketService.create(ticketData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = `Ticket #${response.ticket_number} created successfully!`;
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'Failed to create ticket';
      }
    });
  }

  validateForm(): boolean {
    if (!this.ticket.customer_id) {
      this.errorMessage = 'Please select a customer';
      return false;
    }
    if (!this.ticket.product_id) {
      this.errorMessage = 'Please select a product';
      return false;
    }
    if (!this.ticket.truck_id) {
      this.errorMessage = 'Please select a truck';
      return false;
    }
    if (!this.ticket.truck_weight || this.ticket.truck_weight <= 0) {
      this.errorMessage = 'Please enter truck weight';
      return false;
    }
    if (!this.ticket.gross_weight || this.ticket.gross_weight <= 0) {
      this.errorMessage = 'Gross weight must be greater than 0';
      return false;
    }
    return true;
  }

  resetForm() {
    this.ticket = {
      customer_id: 0,
      product_id: 0,
      truck_id: 0,
      trailer_id: undefined,
      truck_weight: 0,
      pup_weight: 0,
      gross_weight: 0,
      delivery_method: 'location',
      delivery_input_value: '',
      job_name: '',
      delivered_by: '',
      delivery_location: '',
      cc_fee: 0,
      is_wsdot_ticket: false,
      dot_code: '',
      job_number: '',
      contract_number: '',
      comments: ''
    };

    this.selectedCustomer = null;
    this.selectedProduct = null;
    this.selectedTruck = null;
    this.selectedTrailer = null;

    this.calculatedValues = {
      tare: 0,
      netWeight: 0,
      netTons: 0,
      deliveryUnit: '',
      materialCost: 0,
      deliveryCharge: 0,
      subtotal: 0,
      taxRate: 8.5,
      taxAmount: 0,
      total: 0
    };
  }
}
