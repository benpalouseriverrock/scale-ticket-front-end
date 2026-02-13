# 🧪 COMPLETE FRONTEND TESTING GUIDE

## ✅ BEFORE YOU START

Make sure you have:
- ✅ Backend running on `http://localhost:3000`
- ✅ Database loaded with schema and seed data
- ✅ Node.js v14+ installed
- ✅ Angular CLI installed (`npm install -g @angular/cli`)

---

## 🚀 STEP 1: INSTALL & START FRONTEND

### 1.1 Install Dependencies
```bash
cd scale-ticket-frontend
npm install
```
⏱️ **Takes 2-3 minutes**

**Expected output:**
```
added 1200+ packages
```

### 1.2 Verify Backend Configuration
Edit: `src/environments/environment.ts`

Make sure it says:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 1.3 Start Frontend Dev Server
```bash
ng serve
```

**Wait for:**
```
✔ Compiled successfully
Application bundle generation complete
```

**Success indicator:**
- No red errors in console
- See message: "Compiled successfully"

### 1.4 Open in Browser
Go to: **http://localhost:4200**

**Expected result:**
- Page loads
- Navigation bar shows (Tickets, Create Ticket, Update Tare)
- No blank page or errors

---

## 📋 STEP 2: TEST TICKET LIST VIEW

### 2.1 Verify Data Loads
1. Frontend should show "Tickets" tab by default
2. You should see a table with columns:
   - Ticket #
   - Customer
   - Product
   - Gross Weight
   - Net Weight
   - Total
   - Date
   - Actions (Print/Delete buttons)

### 2.2 Check for Initial Tickets
- If no tickets show: **This is OK** (database is fresh)
- If tickets show: **Great!** API is working

### 2.3 Verify No Errors
1. Open browser DevTools: Press **F12**
2. Go to **Console** tab
3. You should see **NO red errors**
4. Ignore warnings (yellow text is OK)

### 2.4 Check Network Requests
1. Stay in DevTools, go to **Network** tab
2. Look for request to `/api/tickets`
3. Click on it
4. In **Response** tab, should see JSON with ticket data

**Success indicators:**
- ✅ Table appears (even if empty)
- ✅ No red console errors
- ✅ Network request to `/api/tickets` succeeds (status 200)

---

## ✏️ STEP 3: TEST CREATE TICKET FORM

### 3.1 Click "Create Ticket" Tab
1. Click **"Create Ticket"** in navigation
2. Form should appear with fields:
   - Customer dropdown
   - Product dropdown
   - Truck dropdown
   - Trailer dropdown
   - Gross Weight input
   - Delivered By input
   - Job Name input
   - Delivery Method dropdown (location/mileage)
   - Delivery Input field
   - WSDOT Ticket checkbox

### 3.2 Fill Out Form - EXAMPLE 1 (Simple Ticket)

**Use this data exactly:**
```
Customer:           Palouse River Rock
Product:            5/8"
Truck:              4
Trailer:            4P
Gross Weight:       70000
Delivered By:       Bob
Job Name:           Test Job #1
Delivery Method:    location
Delivery Input:     Colfax
WSDOT Ticket:       ☐ (unchecked)
```

### 3.3 Submit Form
1. Click **"Create Ticket"** button
2. **Wait 1-2 seconds**

### 3.4 Verify Success
**Success message should appear:**
```
✅ Ticket created: 000001
```

**If you see:**
- ✅ Green success box → GOOD!
- ❌ Red error → Skip to Troubleshooting
- ⚪ Nothing happens → Check console (F12)

### 3.5 Check Created Ticket
1. Click **"Tickets"** tab
2. Scroll to top
3. You should see new ticket with:
   - Ticket #: 000001
   - Customer: Palouse River Rock
   - Product: 5/8"
   - Gross Weight: 70000
   - Net Weight: Should show calculated value
   - Total: Should show calculated price

---

## 🧮 STEP 4: VERIFY AUTO-CALCULATIONS

The backend automatically calculated these values. Check they appear in the ticket list:

### 4.1 Expected Calculated Values

For the ticket you just created:

```
INPUTS:
  Gross Weight:       70000 lbs
  Truck Tare:         30240 lbs (looked up from trucks table)
  Trailer Tare:       8000 lbs (looked up from trailers table)
  Product Price:      $5.50/ton
  Delivery Method:    location (Colfax)
  Delivery Charge:    $10.00 (looked up from delivery_rates)
  Tax Rate:           7.9% (looked up for WA state)

BACKEND AUTO-CALCULATED:
  Net Weight:         70000 - 30240 - 8000 = 31760 lbs
  Net Tons:           31760 / 2000 = 15.88 tons
  Material Cost:      15.88 × $5.50 = $87.34
  Subtotal:           $87.34 + $10.00 = $97.34
  Tax Amount:         $97.34 × 0.079 = $7.69
  Total:              $97.34 + $7.69 = $105.03
```

### 4.2 Verify in Frontend
In the Tickets table, look for the new ticket and verify:
- ✅ Net Weight shows **31760** (or close)
- ✅ Total shows **105.03** (or close to $105)
- ✅ All fields populated (not blank)

### 4.3 View Detailed Values (Browser Console)
1. Press F12 → Console tab
2. Create another ticket
3. Look for log showing ticket details
4. Verify all calculated fields are present

---

## 🚗 STEP 5: TEST LOCATION VS MILEAGE DELIVERY

### 5.1 Test Location-Based Delivery

**Create Ticket 2 (Location):**
```
Customer:           Seubert Gravel
Product:            3/4"
Truck:              6
Trailer:            6P
Gross Weight:       65000
Delivery Method:    location
Delivery Input:     Almota
WSDOT Ticket:       ☐ (unchecked)
```

**Expected:**
- Delivery charge looked up from delivery_rates table
- For "Almota": Should be $15.00
- Total should calculate with this charge

### 5.2 Test Mileage-Based Delivery

**Create Ticket 3 (Mileage):**
```
Customer:           WSDOT Contractor
Product:            Dusty
Truck:              1
Trailer:            (None)
Gross Weight:       60000
Delivery Method:    mileage
Delivery Input:     5-10
WSDOT Ticket:       ☐ (unchecked)
```

**Expected:**
- Delivery rate per mile: $2.00/mile (for 5-10 mile range)
- Net tons × $2.00 = delivery charge
- Total calculates with this charge

### 5.3 Verify in Tickets List
Both tickets should appear with:
- ✅ Different delivery charges
- ✅ Different totals
- ✅ All other calculations correct

---

## 🏷️ STEP 6: TEST WSDOT TICKET FUNCTIONALITY

### 6.1 Create WSDOT Ticket

**Create Ticket 4 (WSDOT):**
```
Customer:           WSDOT Contractor
Product:            3/4"
Truck:              4
Trailer:            4P
Gross Weight:       72000
Delivery Method:    location
Delivery Input:     Colfax
WSDOT Ticket:       ☑ (CHECKED)
DOT Code:           XE3502 SR 104
Contract Number:    XE3502
Job Number:         J001
Mix ID:             MIX-001
Phase Code:         P1
Phase Description:  Phase 1
Dispatch Number:    D001
Purchase Order:     PO-001
Weighmaster:        Bob
Comments:           Test WSDOT ticket
```

### 6.2 Verify WSDOT Fields Appear
When you check "WSDOT Ticket" checkbox, these fields should appear:
- ✅ DOT Code
- ✅ Job Number
- ✅ Mix ID
- ✅ Phase Code
- ✅ Phase Description
- ✅ Dispatch Number
- ✅ Purchase Order Number
- ✅ Weighmaster
- ✅ Comments

### 6.3 Submit & Verify
1. Click "Create Ticket"
2. Should see success message
3. Go to Tickets tab
4. New WSDOT ticket should appear

---

## 🔧 STEP 7: TEST TRUCK TARE UPDATE

### 7.1 Click "Update Tare" Tab
1. Navigation → **"Update Tare"**
2. Should see:
   - Truck selector dropdown
   - Current tare weight display
   - New tare weight input
   - Update button

### 7.2 Select a Truck
1. Click dropdown: "Select Truck"
2. Should show all trucks:
   - 1 (Tare: 25000)
   - 2 (Tare: 28000)
   - etc.

### 7.3 Update Tare Weight

**Example:**
1. Select: Truck "2"
2. Should show:
   - Current Tare Weight: 28000 lbs
   - Configuration: Dump info
3. Change tare to: **29000**
4. Click **"Update"**

### 7.4 Verify Update
1. Should see message: **"Tare weight updated successfully"**
2. Dropdown resets
3. To verify change:
   - Create a new ticket
   - Select Truck "2"
   - Should now show tare: 29000 lbs

---

## 🗑️ STEP 8: TEST DELETE TICKET

### 8.1 Go to Tickets Tab
1. Click **"Tickets"**
2. Find any ticket (preferably test ticket)

### 8.2 Click Delete Button
1. Click **"Delete"** button on any ticket
2. Browser confirmation: "Are you sure?"
3. Click **OK**

### 8.3 Verify Deletion
1. Ticket disappears from table immediately
2. Go back to Tickets tab
3. Ticket should be gone from list

---

## 🖨️ STEP 9: TEST PRINT TICKET

### 9.1 Go to Tickets Tab
1. Click **"Tickets"**
2. Find any ticket

### 9.2 Click Print Button
1. Click **"Print"** button
2. Should see alert: **"Ticket marked as printed"**

### 9.3 Verify in Database
The backend marked `is_printed = TRUE` for this ticket
(You can verify with a database query if needed)

---

## ✅ STEP 10: FINAL VERIFICATION CHECKLIST

Go through this checklist to confirm everything works:

### Data Loading
- ✅ Customers dropdown has 3 options
- ✅ Products dropdown has 9 options
- ✅ Trucks dropdown has 8 options
- ✅ Trailers dropdown has 10 options

### Create Ticket
- ✅ Form submits successfully
- ✅ Success message appears
- ✅ Ticket appears in list immediately
- ✅ All fields populated (no blanks)

### Auto-Calculations
- ✅ Net weight calculated (gross - truck_tare - trailer_tare)
- ✅ Net tons calculated (net_weight / 2000)
- ✅ Delivery charge looked up correctly
- ✅ Tax rate looked up correctly
- ✅ Total calculated correctly

### Delivery Methods
- ✅ Location-based delivery works
- ✅ Mileage-based delivery works
- ✅ Charges different for different methods

### WSDOT Features
- ✅ WSDOT checkbox toggles fields
- ✅ WSDOT fields appear when checked
- ✅ WSDOT ticket creates successfully

### Tare Updates
- ✅ Can select truck
- ✅ Shows current tare
- ✅ Can update tare
- ✅ Update succeeds with message
- ✅ New tickets use updated tare

### Delete & Print
- ✅ Can delete tickets
- ✅ Deleted tickets disappear
- ✅ Can print tickets
- ✅ Print shows success message

### Browser Console
- ✅ NO red errors
- ✅ Network requests all succeed (status 200)
- ✅ API calls match expected endpoints

---

## ❌ TROUBLESHOOTING

### Problem: Dropdowns are Empty
**Cause:** Backend not running or API unreachable

**Fix:**
1. Check backend: `npm run dev` (in backend folder)
2. Check port: Should be 3000
3. Check DevTools → Network tab → Look for failed requests
4. Verify apiUrl in `src/environments/environment.ts`

### Problem: Can't Create Ticket
**Cause:** Form validation or backend error

**Fix:**
1. Make sure ALL required fields (*) are filled
2. Open DevTools → Console tab
3. Look for red error message
4. Check Network tab → POST /api/tickets → Response
5. If 500 error, check backend logs

### Problem: Frontend Won't Start
**Cause:** Dependencies missing or outdated

**Fix:**
```bash
rm -rf node_modules
npm install
ng serve
```

### Problem: Page is Blank
**Cause:** Compilation error

**Fix:**
1. Check terminal for error messages
2. Fix the error
3. Page should auto-reload when fixed

### Problem: "Cannot GET /api/tickets" Error
**Cause:** Backend route not found

**Fix:**
1. Check backend routes are implemented
2. Check ticket route exists: `src/routes/tickets.js`
3. Restart backend

### Problem: Auto-Calculations Wrong
**Cause:** Backend calculation error

**Fix:**
1. Check backend ticketController.js calculation logic
2. Check all referenced tables have correct data
3. Verify tax_rates table has correct state codes
4. Verify delivery_rates table has correct entries

---

## 🎯 SUCCESS - WHAT YOU SHOULD SEE

### Tickets Tab
```
┌─────────┬──────────────────┬───────┬──────────────┬──────────────┬─────────┐
│ Ticket# │ Customer         │Product│ Gross Weight │ Net Weight   │ Total   │
├─────────┼──────────────────┼───────┼──────────────┼──────────────┼─────────┤
│ 000001  │ Palouse River... │ 5/8"  │ 70000        │ 31760        │ $105.03 │
│ 000002  │ Seubert Gravel   │ 3/4"  │ 65000        │ 28760        │ $98.50  │
└─────────┴──────────────────┴───────┴──────────────┴──────────────┴─────────┘
```

### Create Ticket Form
```
✓ Customer: [Dropdown with options]
✓ Product: [Dropdown with options]
✓ Truck: [Dropdown with tare displayed]
✓ Trailer: [Dropdown]
✓ Gross Weight: [Input field]
✓ Delivered By: [Input field]
✓ Delivery Method: [Radio buttons]
✓ WSDOT Ticket: [Checkbox]
✓ [Create Ticket] Button
```

### Browser Console
```
No errors
✓ GET /api/customers (200)
✓ GET /api/products (200)
✓ GET /api/trucks (200)
✓ GET /api/trailers (200)
✓ GET /api/tickets (200)
✓ POST /api/tickets (201)
```

---

## 🚀 YOU'RE DONE!

If all checks pass, your frontend is working perfectly!

**You have:**
- ✅ Functional frontend application
- ✅ Full backend integration
- ✅ Auto-calculations from backend
- ✅ Driver self-service features
- ✅ WSDOT ticket support
- ✅ All CRUD operations working

**Ready for:**
- Production deployment
- User training
- Live operations

---

## 📞 QUICK REFERENCE

| Issue | Command | Fix |
|-------|---------|-----|
| Frontend won't start | `npm install && ng serve` | Reinstall deps |
| Backend not responding | `npm run dev` (in backend) | Start backend |
| Dropdowns empty | Check console (F12) | Backend down |
| Calculation wrong | Check ticketController.js | Backend logic |
| Can't delete | Check Network tab error | Check ID param |

---

**Enjoy your Scale Ticket System!** 🎉

