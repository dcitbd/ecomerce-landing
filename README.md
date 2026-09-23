# 🛒 Dream Cart BD — Official E-Commerce & Management System

> **Slogan:** *You make.*  
> **Specialization:** Office Equipment & Commercial Security Systems  
> **Live Demo:** [Visit Dream Cart BD](https://tinyurl.com/Dream-Cart-BD)

---

## 📌 Executive Summary

**Dream Cart BD** is a high-conversion, client-side e-commerce platform built to streamline the purchase and management of high-tier office technology and security supplies. Designed with pure performance and zero-dependency deployment in mind, it combines a responsive storefront with dynamic checkout intelligence, automatic shipping calculations, localized payments, and an administrative control suite powered by persistent browser storage.

---

## 🏢 Business & Contact Details

| Parameter | Information |
| :--- | :--- |
| **Storefront Location** | Room No. 3 (Ground Floor), Chaudhari Plaza, Paduar Bazar, Bishwa Road, Comilla, Bangladesh |
| **Hotlines** | `+880 1581 703 822` / `+880 181 827 3838` |
| **Platform Link** | [tinyurl.com/Dream-Cart-BD](https://tinyurl.com/Dream-Cart-BD) |
| **Default Admin PIN** | `1234` |

---

## 🌟 Key Architectural Features

### 1. Modern Conversion-Focused Front Store (`index.html`)
* **Urgency & Social Proof Engine:** Integrated live countdown offer timers alongside simulated active/total visitor metrics.
* **Direct Multi-Action Anchors:** Single-click paths to Cart, Direct Order Form, WhatsApp Checkout, and Direct Dialing.
* **Pre-Seeded Catalog:** Configured with 20 professional-grade commercial office items (Double Sensor Money Counters, Paper Shredders, Digital Safes, Ergonomic Chairs, Wireless Scanners, Biometric Devices, Standing Desks, etc.).
* **Media-Rich Modals:** 5–10 high-resolution image galleries per item with automated cycling and dynamic color/variant selectors.

### 2. Algorithmic Address & Automated Shipping Engine
The checkout module parses address inputs via dynamic matching to assign local shipping zones without external API dependencies:

| Destination Zone | Delivery Fee |
| :--- | :--- |
| **Cumilla Intra-City** | 90 ৳ |
| **Dhaka Intra-City** | 110 ৳ |
| **Rest of Bangladesh** | 135 ৳ |

### 3. Integrated Payment Matrix & Automatic Discounts
Selecting any online payment gateway applies an instant **5% discount** to the cart subtotal while rendering transaction capture fields (Sender Mobile & TrxID):

* **bKash:** `01879653143` (Personal) / `01581703822` (Merchant)
* **Nagad:** `01879653143` (Personal)
* **Rocket:** `01581703822` (Personal)
* **Bank Wire:** Islami Bank Bangladesh Limited  
  * **Account Name:** Jainal Abedin  
  * **Account Number:** `20508070200030208`
* **Cash On Delivery (COD):** Native integration without pre-payment requirements.

### 4. Post-Purchase Fulfillment Pipeline
* **Token Generation:** Generates deterministic unique order handles (e.g., `#DCB-XXXXX`).
* **Invoicing:** Production of client-side printable PDF/hardcopy invoices.
* **Customer Routing:** 1-click WhatsApp transmission strings alongside native client email invoice previews.

### 5. Protected Administrative Hub (`admin.html`)
* **Security Layer:** PIN-gated interface (`1234` baseline).
* **Analytics Bar:** Real-time visibility into Gross Revenue, Total Placements, and Pending Actions.
* **Order Processing Table:** Sort, inspect TrxID details, toggle statuses (`Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`), output single invoices, or export data to standard `.csv`.
* **Inventory Control Suite:** Real-time addition of multi-image products, variant registration, pricing adjustments, deletions, and active/inactive stock toggling.
* **Data Layer:** Zero-latency persistence and cross-tab hydration via browser `localStorage`.

---

## 📂 Project Directory Structure

```text
dream-cart-bd/
├── index.html          # Public storefront, checkout, and AI routing logic
├── admin.html          # Secure administrative control panel
├── css/
│   └── style.css       # Layouts, UI tokens, transitions, and media queries
├── js/
│   ├── app.js          # Cart logic, address detection, and checkout flows
│   └── admin.js        # Auth gate, metrics, inventory CRUD, and CSV exports
├── assets/
│   ├── images/         # Static visual assets and seed product catalog media
│   └── icons/          # System iconography
└── README.md           # Operational documentation
