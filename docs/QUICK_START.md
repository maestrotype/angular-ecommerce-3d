# 🚀 Quick Start Guide

Get your Angular E-commerce 3D platform up and running in **less than 10 minutes**!

---

## ⚡ Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js** 18+ installed ([Download](https://nodejs.org/))
- ✅ **PostgreSQL** 14+ installed ([Download](https://www.postgresql.org/download/))
- ✅ **Git** installed ([Download](https://git-scm.com/))
- ✅ Basic command line knowledge

> **💡 Tip**: If you prefer Docker, skip to the [Docker Quick Start](#docker-quick-start) section.

---

## 📦 Installation (5 Minutes)

### Step 1: Download & Extract

Extract the downloaded zip file to your desired location:

```bash
unzip angular-ecommerce-3d.zip
cd angular-ecommerce-3d
```

### Step 2: Install Dependencies

```bash
# Install frontend + backend (npm workspaces)
npm install
```

> **⏱️ Expected time**: 2-3 minutes

---

## ⚙️ Configuration (2 Minutes)

### Step 3: Create Database

Open PostgreSQL and create a database:

```sql
CREATE DATABASE ecommerce_db;
```

### Step 4: Configure Backend

```bash
# Copy environment example
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your database credentials:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=ecommerce_db
JWT_SECRET=your_secret_key_min_32_characters_long
```

> **🔐 Security**: Generate a strong JWT secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 5: Configure Frontend

The frontend is pre-configured for local development. For production deployment, see the [Installation Guide](INSTALLATION.md).

---

## 🎬 Start the Application (1 Minute)

### Step 6: Start Backend Server

Open a terminal window:

```bash
npm run backend:start:dev
```

✅ Backend should be running at `http://localhost:3002`

### Step 7: Start Frontend Server

Open a **new** terminal window:

```bash
npm start
```

✅ Frontend should be running at `http://localhost:4200`

---

## 🎉 Access Your Application

Open your browser and navigate to:

- **🏠 Frontend**: http://localhost:4200
- **👨‍💼 Admin Panel**: http://localhost:4200/admin
- **🔌 API**: http://localhost:3002/api

---

## 🔑 Default Admin Credentials

To access the admin panel, use:

- **Email**: `admin@example.com`
- **Password**: `admin123`

> **⚠️ Important**: Change these credentials immediately after first login!

---

## ✅ Verify Installation

Check that everything is working:

1. ✅ Can you see the homepage?
2. ✅ Can you browse the shop?
3. ✅ Can you view a product with 3D model?
4. ✅ Can you login to admin panel?
5. ✅ Can you see products in admin dashboard?

If all checks pass - **congratulations!** 🎊 Your e-commerce platform is ready!

---

## 🐳 Docker Quick Start

Prefer Docker? Here's how to get started even faster:

```bash
# Start all services with one command
docker-compose up -d

# Wait 30 seconds for services to initialize
# Then access the application at http://localhost:4200
```

That's it! Docker will automatically:
- Set up PostgreSQL database
- Configure backend server
- Start frontend server
- Create admin user

---

## 🛠️ Common Issues

### Issue: "Port 4200 already in use"

**Solution**: Stop other Angular applications or change port:
```bash
npm start -- --port 4300
```

### Issue: "Cannot connect to database"

**Solution**: 
1. Check PostgreSQL is running
2. Verify credentials in `backend/.env`
3. Ensure database `ecommerce_db` exists

### Issue: "Admin login not working"

**Solution**: Create admin user manually:
```bash
npm run backend:start:dev
# In another terminal:
curl -X POST http://localhost:3002/api/auth/create-admin
```

---

## 📚 Next Steps

Now that your application is running:

1. 📖 Read the [Admin Manual](ADMIN_MANUAL.md) to learn how to manage products
2. 🎨 Check the [Customization Guide](CUSTOMIZATION.md) to personalize your store
3. 💳 Set up [Payment Gateways](PAYMENT_SETUP.md)
4. 🌍 Deploy to production (see [Installation Guide](INSTALLATION.md))

---

## 🆘 Need Help?

- 📖 Check the [FAQ](FAQ.md) for common questions
- 📧 Contact support: support@angular-ecommerce3d.com
- 🐛 Report bugs on GitHub Issues

---

**Estimated Total Time**: 5-10 minutes ⏱️

**Congratulations!** You've successfully set up your Angular E-commerce 3D platform! 🚀
