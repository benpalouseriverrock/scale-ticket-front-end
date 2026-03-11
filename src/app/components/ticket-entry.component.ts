import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Ticket, Customer, Product, Truck, Trailer, DeliveryRate, WsdotProject } from '../models/index';
import { TicketService } from '../services/ticket.service';
import { CustomerService } from '../services/customer.service';
import { ProductService } from '../services/product.service';
import { TruckService } from '../services/truck.service';
import { TrailerService } from '../services/trailer.service';
import { DeliveryRateService } from '../services/delivery-rate.service';
import { WsdotProjectService } from '../services/wsdot-project.service';

@Component({
  selector: 'app-ticket-entry',
  templateUrl: './ticket-entry.component.html',
  styleUrls: ['./ticket-entry.component.css']
})
export class TicketEntryComponent implements OnInit {
  @Input() editTicket: any = null;
  @Output() editDone = new EventEmitter<void>();

  // Edit mode state
  editMode = false;
  editingTicketId: number | undefined;

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
    contract_number: '',
    job_number: '',
    mix_id: '',
    phase_code: '',
    phase_description: '',
    dispatch_number: '',
    purchase_order_number: '',
    weighmaster: '',
    comments: ''
  };

  // Dropdown Data
  customers: Customer[] = [];
  products: Product[] = [];
  trucks: Truck[] = [];
  trailers: Trailer[] = [];
  deliveryRates: DeliveryRate[] = [];
  wsdotProjects: WsdotProject[] = [];
  selectedProjectId: number | null = null;

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
  manualTareEnabled = false;
  manualTareWeight = 0;

  constructor(
    private ticketService: TicketService,
    private customerService: CustomerService,
    private productService: ProductService,
    private truckService: TruckService,
    private trailerService: TrailerService,
    private deliveryRateService: DeliveryRateService,
    private wsdotProjectService: WsdotProjectService
  ) {}

  ngOnInit(): void {
    forkJoin({
      customers: this.customerService.getAll(),
      products: this.productService.getAll(),
      trucks: this.truckService.getAll(),
      trailers: this.trailerService.getAll(),
      deliveryRates: this.deliveryRateService.getAll(),
      wsdotProjects: this.wsdotProjectService.getAll()
    }).subscribe({
      next: ({ customers, products, trucks, trailers, deliveryRates, wsdotProjects }) => {
        this.customers = customers;
        this.products = products;
        this.trucks = trucks;
        this.trailers = trailers;
        this.deliveryRates = deliveryRates;
        this.wsdotProjects = wsdotProjects;
        if (this.editTicket) {
          this.populateFormFromTicket(this.editTicket);
        }
      },
      error: () => { this.errorMessage = 'Failed to load form data'; }
    });
  }

  populateFormFromTicket(t: any) {
    this.editMode = true;
    this.editingTicketId = t.ticket_id;

    this.ticket = {
      customer_id: Number(t.customer_id),
      product_id: Number(t.product_id),
      truck_id: Number(t.truck_id),
      trailer_id: t.trailer_id ? Number(t.trailer_id) : undefined,
      truck_weight: Number(t.truck_weight) || 0,
      pup_weight: Number(t.pup_weight) || 0,
      gross_weight: Number(t.gross_weight) || 0,
      delivery_method: t.delivery_method || 'location',
      delivery_input_value: t.delivery_input_value || '',
      job_name: t.job_name || '',
      delivered_by: t.delivered_by || '',
      delivery_location: t.delivery_location || '',
      cc_fee: Number(t.cc_fee) || 0,
      is_wsdot_ticket: t.is_wsdot_ticket || false,
      dot_code: t.dot_code || '',
      contract_number: t.contract_number || '',
      job_number: t.job_number || '',
      mix_id: t.mix_id || '',
      phase_code: t.phase_code || '',
      phase_description: t.phase_description || '',
      dispatch_number: t.dispatch_number || '',
      purchase_order_number: t.purchase_order_number || '',
      weighmaster: t.weighmaster || '',
      comments: t.comments || ''
    };

    this.selectedCustomer = this.customers.find(c => c.customer_id === t.customer_id) || null;
    this.selectedProduct = this.products.find(p => p.product_id === t.product_id) || null;
    this.selectedTruck = this.trucks.find(tr => tr.truck_id === t.truck_id) || null;
    this.selectedTrailer = t.trailer_id
      ? (this.trailers.find(tr => tr.trailer_id === t.trailer_id) || null)
      : null;

    if (this.selectedCustomer) {
      this.calculatedValues.taxRate = this.getTaxRateForState(this.selectedCustomer.customer_state);
    }

    this.updateDeliveryUnit();

    // Detect manual tare: if stored tare differs from truck+trailer tare
    if (this.selectedTruck) {
      const expectedTare = (Number(this.selectedTruck.tare_weight) || 0)
        + (Number(this.selectedTrailer?.tare_weight) || 0);
      if (Math.abs(expectedTare - Number(t.tare_weight)) > 0.5) {
        this.manualTareEnabled = true;
        this.manualTareWeight = Number(t.tare_weight);
      }
    }

    this.calculateAll();
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

    // ✅ STEP 1: Calculate Tare (truck + trailer, or manual override)
    const truckTare = Number(this.selectedTruck.tare_weight) || 0;
    const trailerTare = Number(this.selectedTrailer?.tare_weight) || 0;
    const autoTare = truckTare + trailerTare;
    if (this.manualTareEnabled) {
      this.calculatedValues.tare = Number(this.manualTareWeight) || 0;
    } else {
      this.calculatedValues.tare = autoTare;
      this.manualTareWeight = autoTare; // keep in sync for when user enables override
    }

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

    // per_ton / per_load: inputValue IS the rate — no DB lookup needed
    if (this.ticket.delivery_method === 'per_ton') {
      const ratePerTon = Number(this.ticket.delivery_input_value) || 0;
      return ratePerTon * this.calculatedValues.netTons;
    }
    if (this.ticket.delivery_method === 'per_load') {
      return Number(this.ticket.delivery_input_value) || 0;
    }

    // location / mileage: look up from rate table
    const rate = this.deliveryRates.find(r =>
      r.method === this.ticket.delivery_method &&
      r.input_value === this.ticket.delivery_input_value &&
      r.active
    );

    if (!rate) return 0;

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
    const ticketData: any = {
      ...this.ticket,
      delivery_unit: this.calculatedValues.deliveryUnit,
      ...(this.manualTareEnabled ? { manual_tare_override: this.manualTareWeight } : {})
    };

    const save$ = this.editMode && this.editingTicketId
      ? this.ticketService.update(this.editingTicketId, ticketData)
      : this.ticketService.create(ticketData);

    save$.subscribe({
      next: (response) => {
        this.loading = false;
        if (this.editMode) {
          this.successMessage = `Ticket #${response.ticket_number} updated successfully!`;
          setTimeout(() => this.editDone.emit(), 1200);
        } else {
          this.successMessage = `Ticket #${response.ticket_number} created successfully!`;
          this.resetForm();
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.error || (this.editMode ? 'Failed to update ticket' : 'Failed to create ticket');
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

  onProjectChange() {
    if (!this.selectedProjectId) return;
    const project = this.wsdotProjects.find(p => p.project_id === Number(this.selectedProjectId));
    if (!project) return;
    this.ticket.contract_number    = project.contract_number    || '';
    this.ticket.dot_code           = project.dot_code           || '';
    this.ticket.job_number         = project.job_number         || '';
    this.ticket.mix_id             = project.mix_id             || '';
    this.ticket.phase_code         = project.phase_code         || '';
    this.ticket.phase_description  = project.phase_description  || '';
    this.ticket.dispatch_number    = project.dispatch_number    || '';
    this.ticket.purchase_order_number = project.purchase_order_number || '';
    this.ticket.weighmaster        = project.weighmaster        || '';
  }

  cancelEdit() {
    this.editDone.emit();
  }

  onManualTareToggle() {
    if (this.manualTareEnabled && this.calculatedValues.tare > 0) {
      this.manualTareWeight = this.calculatedValues.tare;
    }
    this.calculateAll();
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
      contract_number: '',
      job_number: '',
      mix_id: '',
      phase_code: '',
      phase_description: '',
      dispatch_number: '',
      purchase_order_number: '',
      weighmaster: '',
      comments: ''
    };

    this.selectedCustomer = null;
    this.selectedProduct = null;
    this.selectedTruck = null;
    this.selectedTrailer = null;
    this.manualTareEnabled = false;
    this.manualTareWeight = 0;
    this.selectedProjectId = null;

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
