import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProductService } from '../services/product.service';
import { DeliveryRateService } from '../services/delivery-rate.service';
import { SupplierService } from '../services/supplier.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  activeTab: 'products' | 'delivery-rates' = 'products';

  // Products
  products: any[] = [];
  suppliers: any[] = [];
  editingProduct: any = null;
  newProduct = { product_name: '', supplier_id: 0, price_per_ton: 0, material_category: '' };
  showAddProduct = false;
  productMessage = '';
  productSuccess = false;

  // Delivery Rates
  deliveryRates: any[] = [];
  editingRate: any = null;
  newRate = { method: 'location', input_value: '', flat_rate: 0, minimum_charge: 0 };
  showAddRate = false;
  rateMessage = '';
  rateSuccess = false;

  constructor(
    private productService: ProductService,
    private deliveryRateService: DeliveryRateService,
    private supplierService: SupplierService
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    forkJoin({
      products: this.productService.getAll(),
      deliveryRates: this.deliveryRateService.getAll(),
      suppliers: this.supplierService.getAll()
    }).subscribe({
      next: ({ products, deliveryRates, suppliers }) => {
        this.products = products;
        this.deliveryRates = deliveryRates;
        this.suppliers = suppliers;
      }
    });
  }

  setTab(tab: 'products' | 'delivery-rates') {
    this.activeTab = tab;
    this.clearMessages();
    this.editingProduct = null;
    this.editingRate = null;
    this.showAddProduct = false;
    this.showAddRate = false;
  }

  clearMessages() {
    this.productMessage = '';
    this.rateMessage = '';
  }

  // --- Products ---
  startEditProduct(product: any) {
    this.editingProduct = { ...product };
    this.showAddProduct = false;
  }

  cancelEditProduct() {
    this.editingProduct = null;
  }

  saveProduct() {
    if (!this.editingProduct.product_name || !this.editingProduct.price_per_ton) {
      this.productMessage = 'Product name and price are required';
      this.productSuccess = false;
      return;
    }
    this.productService.update(this.editingProduct.product_id, {
      product_name: this.editingProduct.product_name,
      price_per_ton: this.editingProduct.price_per_ton,
      material_category: this.editingProduct.material_category
    } as any).subscribe({
      next: () => {
        this.productMessage = 'Product updated successfully';
        this.productSuccess = true;
        this.editingProduct = null;
        this.loadAll();
      },
      error: (err) => {
        this.productMessage = 'Error: ' + (err.error?.error || err.message);
        this.productSuccess = false;
      }
    });
  }

  addProduct() {
    if (!this.newProduct.product_name || !this.newProduct.price_per_ton || !this.newProduct.supplier_id) {
      this.productMessage = 'Product name, supplier, and price are required';
      this.productSuccess = false;
      return;
    }
    this.productService.create(this.newProduct as any).subscribe({
      next: (res: any) => {
        this.productMessage = `Product "${res.product_name}" added successfully`;
        this.productSuccess = true;
        this.newProduct = { product_name: '', supplier_id: 0, price_per_ton: 0, material_category: '' };
        this.showAddProduct = false;
        this.loadAll();
      },
      error: (err) => {
        this.productMessage = 'Error: ' + (err.error?.error || err.message);
        this.productSuccess = false;
      }
    });
  }

  // --- Delivery Rates ---
  startEditRate(rate: any) {
    this.editingRate = { ...rate };
    this.showAddRate = false;
  }

  cancelEditRate() {
    this.editingRate = null;
  }

  saveRate() {
    this.deliveryRateService.update(this.editingRate.delivery_rate_id, {
      flat_rate: this.editingRate.flat_rate,
      minimum_charge: this.editingRate.minimum_charge
    } as any).subscribe({
      next: () => {
        this.rateMessage = 'Delivery rate updated successfully';
        this.rateSuccess = true;
        this.editingRate = null;
        this.loadAll();
      },
      error: (err) => {
        this.rateMessage = 'Error: ' + (err.error?.error || err.message);
        this.rateSuccess = false;
      }
    });
  }

  addRate() {
    if (!this.newRate.input_value || !this.newRate.flat_rate) {
      this.rateMessage = 'Location/range and rate are required';
      this.rateSuccess = false;
      return;
    }
    this.deliveryRateService.create(this.newRate as any).subscribe({
      next: () => {
        this.rateMessage = 'Delivery rate added successfully';
        this.rateSuccess = true;
        this.newRate = { method: 'location', input_value: '', flat_rate: 0, minimum_charge: 0 };
        this.showAddRate = false;
        this.loadAll();
      },
      error: (err) => {
        this.rateMessage = 'Error: ' + (err.error?.error || err.message);
        this.rateSuccess = false;
      }
    });
  }
}
