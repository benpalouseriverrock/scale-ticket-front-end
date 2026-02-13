# Scale Ticket System - Angular Frontend

## ✅ Complete Frontend Ready

This is a fully functional Angular 15 frontend for the Scale Ticket System backend.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend URL
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 3. Start the Frontend
```bash
ng serve
```

Frontend runs on: `http://localhost:4200`

## 📋 Components Included

✅ **TicketListComponent**
   - View all scale tickets
   - Paginated with 20 tickets per page
   - Print and delete functionality
   - Real-time totals display

✅ **TicketEntryComponent**
   - Create new scale tickets
   - Single gross_weight input
   - Automatic tare weight lookup
   - Delivery method toggle (location/mileage)
   - WSDOT ticket option
   - Real-time form validation

✅ **TruckTareComponent**
   - Driver self-service tare weight update
   - Select truck and enter new tare
   - Immediate update to database

## 🔗 API Integration

All 8 tables fully integrated:
- Customers
- Products  
- Suppliers
- Trucks
- Trailers
- Tax Rates
- Delivery Rates
- Tickets (with auto-calculations)

## 📚 Services

✅ TicketService - Create, read, delete tickets
✅ CustomerService - Customer management
✅ ProductService - Product management
✅ TruckService - Truck management + tare updates
✅ TrailerService - Trailer management
✅ SupplierService - Supplier management
✅ TaxRateService - Tax rate management
✅ DeliveryRateService - Delivery rate management

## 🧪 Testing

See TESTING_GUIDE.txt for complete step-by-step testing instructions.

## 📁 Project Structure

```
src/
├── app/
│   ├── app.component.ts/html/css
│   └── app.module.ts
├── components/
│   ├── ticket-entry.component.ts/html
│   ├── ticket-list.component.ts/html
│   └── truck-tare.component.ts/html
├── services/
│   ├── ticket.service.ts
│   ├── customer.service.ts
│   ├── product.service.ts
│   ├── truck.service.ts
│   ├── trailer.service.ts
│   ├── supplier.service.ts
│   ├── tax-rate.service.ts
│   └── delivery-rate.service.ts
├── models/
│   └── index.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
├── index.html
├── main.ts
└── styles.css
```

## ✨ Features

- ✅ Create scale tickets with auto-calculations
- ✅ View all tickets with pagination
- ✅ Print and delete tickets
- ✅ Driver self-service tare updates
- ✅ Real-time form validation
- ✅ Responsive Bootstrap UI
- ✅ Location & mileage-based delivery charges
- ✅ WSDOT ticket support
- ✅ Auto-calculated totals and taxes

## 🔧 Build for Production

```bash
ng build --configuration production
```

Output: `dist/scale-ticket-frontend`
