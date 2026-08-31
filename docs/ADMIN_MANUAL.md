# 👨‍💼 Admin Panel Manual

Complete guide to managing your Angular E-commerce 3D platform.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Products](#managing-products)
4. [Managing Orders](#managing-orders)
5. [Managing Users](#managing-users)
6. [Managing Categories](#managing-categories)
7. [Messages & Support](#messages--support)
8. [Settings](#settings)
9. [Theme Management](#theme-management)
10. [Reports & Analytics](#reports--analytics)

---

## 🚀 Getting Started

### Accessing the Admin Panel

1. Navigate to: `http://yourdomain.com/admin`
2. Enter your credentials:
   - **Email**: Your admin email
   - **Password**: Your admin password

> **⚠️ First Login**: Default credentials are `admin@example.com` / `admin123`. **Change these immediately!**

### Changing Your Password

1. Click on profile icon (top right)
2. Select "Profile Settings"
3. Click "Change Password"
4. Enter current and new password
5. Click "Save Changes"

---

## 📊 Dashboard Overview

After logging in, you'll see the main dashboard with:

### Key Metrics (Top Cards)

| Metric | Description |
|--------|-------------|
| **Total Revenue** | Total sales this month |
| **Total Orders** | Number of orders this month |
| **Total Products** | Active products in catalog |
| **Total Users** | Registered customers |

### Sales Chart

- **Visualization**: Monthly sales trends
- **Period**: Last 12 months
- **Interaction**: Hover to see exact values

### Recent Orders

- Shows last 10 orders
- Quick status overview
- Click order to view details

### Low Stock Alerts

- Products with stock < 10 units
- Quick restock actions
- Click to edit product

---

## 🛍️ Managing Products

### View All Products

1. Navigate to **Products** → **Product List**
2. You'll see a table with all products:
   - Product name & image
   - Category
   - Price
   - Stock quantity
   - Status (Active/Inactive)
   - Actions

### Filter & Search Products

- **Search**: Use search box to find by name/SKU
- **Filter by Category**: Dropdown menu
- **Filter by Status**: Active/Inactive
- **Sort**: Click column headers

### Add New Product

#### Step 1: Basic Information

1. Click **"+ Add New Product"** button
2. Fill in basic details:
   - **Product Name** (required)
   - **SKU** - Auto-generated or custom
   - **Category** (required)
   - **Brand**
   - **Description** (required)

#### Step 2: Pricing

- **Regular Price** (required)
- **Sale Price** (optional)
- **Discount Percentage** - Auto-calculated

#### Step 3: Inventory

- **Stock Quantity** (required)
- **Track Inventory** - Enable/disable
- **Low Stock Threshold** - Default: 10
- **Allow Backorders** - Yes/No

#### Step 4: Images

**Main Product Image:**
1. Click "Upload Image" or drag & drop
2. Supported formats: JPG, PNG, WebP
3. Recommended size: 800x800px
4. Max size: 5MB

**Additional Images (Gallery):**
1. Click "+ Add More Images"
2. Upload up to 10 additional images
3. Drag to reorder
4. Click ❌ to remove

**AI Background Removal:**
- Enable toggle if Remove.bg API is configured
- Automatically removes background
- Saves transparent PNG

#### Step 5: 3D Model Upload

This is the **unique feature** of your platform!

**Upload 3D Model:**
1. Scroll to "3D Model" section
2. Click "Upload 3D Model"
3. Select file:
   - **Formats**: .glb, .gltf
   - **Max size**: 50MB (10MB recommended)
   - **Optimization**: Use compressed models
4. Preview will load automatically

**3D Model Settings:**
- **Enable 3D Viewer** - Show/hide on product page
- **Auto-rotate** - Enable/disable auto-rotation
- **Camera Position** - Default view angle
- **Scale** - Adjust model size

**Tips for 3D Models:**
- Use Blender or similar tools to create models
- Export as GLB (binary) for best performance
- Optimize textures (max 2048x2048px)
- Test on mobile devices

#### Step 6: Specifications & Features

**Specifications:**
1. Click "+ Add Specification"
2. Enter key-value pairs:
   - Example: "Material" → "Stainless Steel"
   - Example: "Weight" → "2.5 kg"

**Features:**
1. Click "+ Add Feature"
2. Enter feature description
3. Drag to reorder
4. Features appear as bullet points

#### Step 7: SEO Settings

- **Meta Title** - Page title for search engines
- **Meta Description** - Search result description
- **URL Slug** - Auto-generated or custom
- **Keywords** - Comma-separated

#### Step 8: Advanced Options

- **Featured Product** - Show on homepage
- **New Arrival** - Show in "New" section
- **Best Seller** - Show in "Best Sellers"
- **Publish Date** - Schedule for future
- **Status** - Active/Inactive/Draft

#### Step 9: Save

1. Click **"Save Product"** - Save and return to list
2. Click **"Save & Add Another"** - Save and add new
3. Click **"Preview"** - See how it looks

### Edit Existing Product

1. Go to **Products** → **Product List**
2. Click **✏️ Edit** icon on product row
3. Modify any fields
4. Click **"Update Product"**

### Delete Product

1. Find product in list
2. Click **🗑️ Delete** icon
3. Confirm deletion

> **⚠️ Warning**: Deleted products cannot be recovered!

**Better Alternative**: Set status to "Inactive" instead of deleting.

### Bulk Actions

1. Select multiple products (checkboxes)
2. Choose action from dropdown:
   - Activate
   - Deactivate
   - Delete
   - Change Category
   - Export to CSV
3. Click **"Apply"**

### Import Products (CSV)

1. Go to **Products** → **Import**
2. Download CSV template
3. Fill in product data
4. Upload CSV file
5. Map columns
6. Click **"Import"**

**CSV Format:**
```csv
name,sku,category,price,stock,description,imageUrl
Product Name,SKU123,Electronics,99.99,50,"Description",https://...
```

### Export Products

1. Go to **Products** → **Product List**
2. Click **"Export"** button
3. Choose format: CSV or Excel
4. Download file

---

## 📦 Managing Orders

### View All Orders

1. Navigate to **Orders** → **Order List**
2. Table shows:
   - Order number
   - Customer name
   - Date
   - Total amount
   - Payment status
   - Order status
   - Actions

### Order Statuses

| Status | Meaning | Next Action |
|--------|---------|-------------|
| **Pending** | Payment not confirmed | Wait for payment |
| **Processing** | Payment received | Prepare shipment |
| **Shipped** | Order dispatched | Update tracking |
| **Delivered** | Customer received | Mark complete |
| **Cancelled** | Order cancelled | Issue refund |
| **Refunded** | Money returned | Close order |

### View Order Details

1. Click on order number or **👁️ View** icon
2. You'll see:

**Customer Information:**
- Name, email, phone
- Shipping address
- Billing address

**Order Items:**
- Product names & images
- Quantities
- Prices
- Subtotal

**Payment Information:**
- Payment method
- Transaction ID
- Payment status
- Total amount

**Order Timeline:**
- All status changes
- Timestamps
- Admin notes

### Update Order Status

1. Open order details
2. Click **"Change Status"** dropdown
3. Select new status:
   - Processing
   - Shipped
   - Delivered
   - Cancelled
4. (Optional) Add tracking number
5. (Optional) Send email notification
6. Click **"Update"**

### Add Order Notes

1. Open order details
2. Scroll to "Order Notes" section
3. Type note (visible only to admins)
4. Click **"Add Note"**

### Process Refund

1. Open order details
2. Click **"Issue Refund"** button
3. Select refund type:
   - Full refund
   - Partial refund
4. Enter amount (for partial)
5. Enter reason
6. Click **"Process Refund"**

> **Note**: Refunds are processed through original payment gateway.

### Print Invoice

1. Open order details
2. Click **"Print Invoice"** button
3. Invoice PDF will download

### Send Order Email

1. Open order details
2. Click **"Send Email"** dropdown
3. Choose template:
   - Order Confirmation
   - Shipping Notification
   - Delivery Confirmation
4. Click **"Send"**

---

## 👥 Managing Users

### View All Users

1. Navigate to **Users** → **User List**
2. Table shows:
   - Name & email
   - Registration date
   - Role (Admin/Customer)
   - Status (Active/Blocked)
   - Total orders
   - Actions

### Add New User

1. Click **"+ Add User"** button
2. Fill in details:
   - Full Name
   - Email (unique)
   - Password
   - Role: Admin or Customer
   - Status: Active or Blocked
3. Click **"Create User"**

### Edit User

1. Click **✏️ Edit** icon
2. Modify details (cannot change email)
3. Click **"Update User"**

### Block/Unblock User

1. Find user in list
2. Toggle **Status** switch
3. Blocked users cannot login

### View User Orders

1. Click **"View Orders"** link on user row
2. See all orders by this customer
3. Click order to view details

### Delete User

1. Click **🗑️ Delete** icon
2. Confirm deletion

> **⚠️ Warning**: Deletes user but keeps their orders.

---

## 📁 Managing Categories

### View All Categories

1. Navigate to **Products** → **Categories**
2. Hierarchical tree view
3. Shows product count

### Add Category

1. Click **"+ Add Category"**
2. Enter:
   - Category Name
   - Slug (auto-generated)
   - Parent Category (optional)
   - Description
   - Image (optional)
   - SEO Meta tags
3. Click **"Save"**

### Edit Category

1. Click on category name
2. Modify details
3. Click **"Update"**

### Delete Category

1. Click **🗑️ Delete** icon
2. Choose what to do with products:
   - Move to another category
   - Delete products
   - Make products uncategorized
3. Confirm

---

## 💬 Messages & Support

### View Customer Messages

1. Navigate to **Messages**
2. Inbox shows:
   - Customer name
   - Subject
   - Date received
   - Read/Unread status

### Reply to Message

1. Click on message
2. Read customer inquiry
3. Type reply in text box
4. Click **"Send Reply"**

### Mark as Resolved

1. Open message
2. Click **"Mark as Resolved"**
3. Message moves to "Resolved" folder

---

## ⚙️ Settings

### General Settings

1. Navigate to **Settings** → **General**

**Store Information:**
- Store Name
- Tagline
- Email
- Phone
- Address

**Social Media:**
- Facebook URL
- Instagram URL
- Twitter URL
- YouTube URL

**Timezone & Currency:**
- Default Timezone
- Currency (USD, EUR, etc.)
- Currency Symbol Position

### Payment Settings

1. Go to **Settings** → **Payments**

**Stripe:**
- Enable/Disable
- Publishable Key
- Secret Key
- Webhook Secret

**PayPal:**
- Enable/Disable
- Client ID
- Client Secret
- Mode (Sandbox/Live)

**LiqPay:**
- Enable/Disable
- Public Key
- Private Key

See [Payment Setup Guide](PAYMENT_SETUP.md) for details.

### Email Settings

1. Go to **Settings** → **Email**

**SMTP Configuration:**
- Host
- Port
- Username
- Password
- From Name
- From Email

**Email Templates:**
- Order Confirmation
- Shipping Notification
- Password Reset
- Welcome Email

### SEO Settings

1. Go to **Settings** → **SEO**

- Site Title
- Meta Description
- Meta Keywords
- Google Analytics ID
- Google Tag Manager ID
- Facebook Pixel ID

### Shipping Settings

1. Go to **Settings** → **Shipping**

**Shipping Methods:**
- Standard Shipping
- Express Shipping
- Free Shipping (threshold)

**Shipping Zones:**
- Domestic
- International
- Custom zones

---

## 🎨 Theme Management

Your platform includes **4 premium themes**!

### Change Active Theme

1. Navigate to **Settings** → **Appearance**
2. View theme previews:
   - **Light** — clean, minimal
   - **Dark** — slate dark mode
   - **Ice** — cool blue admin chrome (`data-theme="glass"`; storefront name is **Aurora**)
   - **Ember** — warm admin chrome (`data-theme="dark-glass"`)
3. Click **"Activate"** on desired theme
4. Click **"Preview"** to see before activating

### Customize Theme

1. Go to **Settings** → **Appearance** → **Customize**

**Colors:**
- Primary Color
- Secondary Color
- Accent Color
- Background Color
- Text Color

**Typography:**
- Font Family
- Font Sizes
- Line Heights

**Layout:**
- Header Style
- Footer Style
- Sidebar Position

**Buttons:**
- Button Style
- Border Radius
- Hover Effects

3. Click **"Save Changes"**

### Upload Custom Logo

1. Go to **Settings** → **Appearance**
2. Click "Upload Logo"
3. Recommended size: 200x60px
4. Format: PNG with transparent background
5. Click **"Save"**

---

## 📈 Reports & Analytics

### Sales Reports

1. Navigate to **Reports** → **Sales**

**Views:**
- Daily sales
- Monthly sales
- Yearly sales
- Custom date range

**Metrics:**
- Total revenue
- Average order value
- Number of orders
- Top selling products

**Export:**
- CSV
- PDF
- Excel

### Product Performance

1. Go to **Reports** → **Products**

**Metrics:**
- Best sellers
- Worst performers
- Stock levels
- Out of stock items

### Customer Reports

1. Go to **Reports** → **Customers**

**Metrics:**
- New customers (period)
- Repeat customers
- Customer lifetime value
- Top customers

---

## 🔐 Security Best Practices

### Recommended Actions

1. **Change default admin password** immediately
2. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
3. **Enable two-factor authentication** (if available)
4. **Review user permissions** regularly
5. **Keep software updated**
6. **Backup database** weekly
7. **Monitor admin login attempts**
8. **Use HTTPS** in production

### Backup Database

```bash
# From backend directory
npm run backup

# Or manually with pg_dump
pg_dump -U postgres ecommerce_db > backup.sql
```

---

## 🆘 Common Tasks

### How to feature a product on homepage?

1. Edit product
2. Check "Featured Product"
3. Save

### How to create a sale/discount?

1. Edit product
2. Enter "Sale Price" lower than regular price
3. System auto-calculates discount %
4. Save

### How to handle out-of-stock products?

1. Edit product
2. Set stock to 0
3. Or set status to "Inactive"
4. Save

### How to add a new admin user?

1. Go to **Users** → **Add User**
2. Fill details
3. Set **Role** to "Admin"
4. Save

---

## 📚 Next Steps

- 🎨 [Customize Your Store](CUSTOMIZATION.md)
- 💳 [Set Up Payment Gateways](PAYMENT_SETUP.md)
- ❓ [Read FAQ](FAQ.md)

---

## 🆘 Support

Need help?

- 📧 Email: support@angular-ecommerce3d.com
- 📖 [FAQ](FAQ.md)
- 🐛 Report issues via support channel

---

**Admin Manual Version**: 1.0  
**Last Updated**: January 2026
