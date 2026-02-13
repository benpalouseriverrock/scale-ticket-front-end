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
    trailer_id: undefined,  // ← FIXED: Use undefined instead of null
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
  successMessage = '';
  errorMessage = '';
  loading = false;
  createdTicketNumber: string = '';

  constructor(
    private ticketService: TicketService,
    private customerService: CustomerService,
    private productService: ProductService,
    private truckService: TruckService,
    private trailerService: TrailerService,
    private deliveryRateService: DeliveryRateService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.customerService.getAll().subscribe(data => this.customers = data);
    this.productService.getAll().subscribe(data => this.products = data);
    this.truckService.getAll().subscribe(data => this.trucks = data);
    this.trailerService.getAll().subscribe(data => this.trailers = data);
    this.deliveryRateService.getAll().subscribe(data => this.deliveryRates = data);
  }

  // Customer Selection - Auto-populate info
  onCustomerChange() {
    // Convert to number to handle string values from dropdown
    const customerId = Number(this.ticket.customer_id);
    const customer = this.customers.find(c => c.customer_id === customerId);
    this.selectedCustomer = customer || null;
    
    if (customer) {
      // Set tax rate based on state
      this.calculatedValues.taxRate = this.getTaxRateForState(customer.customer_state);
      this.calculateAll();
    }
  }

  // Product Selection - Auto-populate pricing
  onProductChange() {
    // Convert to number to handle string values from dropdown
    const productId = Number(this.ticket.product_id);
    const product = this.products.find(p => p.product_id === productId);
    this.selectedProduct = product || null;
    this.calculateAll();
  }

  // Truck Selection
  onTruckChange() {
    // Convert to number to handle string values from dropdown
    const truckId = Number(this.ticket.truck_id);
    const truck = this.trucks.find(t => t.truck_id === truckId);
    this.selectedTruck = truck || null;
    this.updateDeliveryUnit();
    this.calculateAll();
  }

  // Trailer Selection
  onTrailerChange() {
    // Convert to number to handle string values from dropdown
    const trailerId = this.ticket.trailer_id ? Number(this.ticket.trailer_id) : null;
    const trailer = trailerId ? this.trailers.find(t => t.trailer_id === trailerId) : null;
    this.selectedTrailer = trailer || null;
    this.updateDeliveryUnit();
    this.calculateAll();
  }

  // Update Delivery Unit Description
  updateDeliveryUnit() {
    if (this.selectedTruck) {
      this.calculatedValues.deliveryUnit = this.selectedTruck.unit_number;
      if (this.selectedTrailer) {
        this.calculatedValues.deliveryUnit += ` with ${this.selectedTrailer.unit_number}`;
      }
      this.ticket.delivery_unit = this.calculatedValues.deliveryUnit;
    }
  }

  // Get Tax Rate Based on State
  getTaxRateForState(state?: string): number {
    if (!state) return 8.5;
    if (state === 'ID') return 6.0;
    if (state === 'WA') return 7.9;
    return 8.5; // Default
  }

  // Calculate All Values
  calculateAll() {
    // Early return if required fields are missing
    if (!this.selectedProduct || !this.selectedTruck) {
      console.log('Cannot calculate - missing product or truck:', {
        hasProduct: !!this.selectedProduct,
        hasTruck: !!this.selectedTruck
      });
      return;
    }

    // 1. Calculate Tare
    const truckTare = Number(this.selectedTruck.tare_weight) || 0;
    const trailerTare = Number(this.selectedTrailer?.tare_weight) || 0;
    this.calculatedValues.tare = truckTare + trailerTare;

    // 2. Calculate Net Weight
    const grossWeight = Number(this.ticket.gross_weight) || 0;
    this.calculatedValues.netWeight = grossWeight - this.calculatedValues.tare;
    this.calculatedValues.netTons = this.calculatedValues.netWeight / 2000;

    // Debug logging
    console.log('Weight Calculations:', {
      truckTare,
      trailerTare,
      totalTare: this.calculatedValues.tare,
      grossWeight,
      netWeight: this.calculatedValues.netWeight,
      netTons: this.calculatedValues.netTons
    });

    // 3. Calculate Material Cost
    const pricePerTon = Number(this.selectedProduct.price_per_ton) || 0;
    this.calculatedValues.materialCost = this.calculatedValues.netTons * pricePerTon;

    // 4. Estimate Delivery Charge (simplified - actual calculation on backend)
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

  // Estimate Delivery Charge (simplified version - backend does exact calculation)
  estimateDeliveryCharge(): number {
    if (!this.ticket.delivery_method || !this.ticket.delivery_input_value) {
      return 0;
    }

    console.log('Estimating delivery charge:', {
      method: this.ticket.delivery_method,
      input: this.ticket.delivery_input_value,
      availableRates: this.deliveryRates
    });

    // Find matching rate
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
      const charge = rate.flat_rate || 0;
      console.log('Location-based charge:', charge);
      return charge;
    } else if (this.ticket.delivery_method === 'mileage') {
      const miles = parseFloat(this.ticket.delivery_input_value || '0');
      const charge = (rate.rate_per_mile || 0) * miles;
      console.log('Mileage-based charge:', { miles, ratePerMile: rate.rate_per_mile, total: charge });
      return charge;
    }

    return 0;
  }

  // Trigger recalculation when gross weight changes
  onGrossWeightChange() {
    this.calculateAll();
  }

  // Trigger recalculation when delivery changes
  onDeliveryChange() {
    this.calculateAll();
  }

  // Validate Form
  validateForm(): boolean {
    if (!this.ticket.customer_id || !this.ticket.product_id || !this.ticket.truck_id || !this.ticket.gross_weight) {
      this.errorMessage = 'Please fill in all required fields: Customer, Product, Truck, and Gross Weight';
      return false;
    }
    debugger;
    if (this.ticket.gross_weight <= this.calculatedValues.tare) {
      this.errorMessage = 'Gross weight must be greater than tare weight';
      return false;
    }

    return true;
  }

  // Preview Ticket
  previewTicket() {
    if (!this.validateForm()) {
      return;
    }

    this.calculateAll();
    this.successMessage = 'Preview generated - review calculations above';
    setTimeout(() => this.successMessage = '', 3000);
  }

  // Submit Ticket
  submitTicket() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    // Prepare ticket data
    const ticketData = { ...this.ticket };

    this.ticketService.create(ticketData).subscribe({
      next: (response) => {
        this.successMessage = `Ticket #${response.ticket_number} created successfully!`;
        this.createdTicketNumber = response.ticket_number || '';
        this.loading = false;
        
        // Optionally reset form
        setTimeout(() => {
          if (confirm('Ticket created! Do you want to create another ticket?')) {
            this.resetForm();
          }
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = 'Error creating ticket: ' + (error.error?.error || error.message);
        this.loading = false;
        console.error('Ticket creation error:', error);
      }
    });
  }

  // Print Ticket
  printTicket(ticketNumber: string) {
    // Navigate to print view or open in new window
    window.open(`/tickets/${ticketNumber}/print`, '_blank');
  }

  // Reset Form
  resetForm() {
    this.ticket = {
      customer_id: 0,
      product_id: 0,
      truck_id: 0,
      trailer_id: undefined,  // ← FIXED: Use undefined instead of null
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

    this.successMessage = '';
    this.errorMessage = '';
    this.createdTicketNumber = '';
  }
}
