# 🍊 Fruitables — Full-Stack E-Commerce Platform

> A fully functional **fruits & vegetables** e-commerce web application built with **Express.js**, **SQLite**, and a **vanilla HTML/CSS/JS** frontend.  
> Designed with a clean **Controller → Route → Service → Repository** layered architecture that is ready for microservice extraction.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-F7DF1E?logo=jsonwebtokens&logoColor=black)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Security Practices](#-security-practices)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## ✨ Features

| Area | Detail |
|------|--------|
| 🛒 **Product Catalog** | Browse fruits & vegetables with category filtering and search |
| 🔐 **Authentication** | Register / Login with bcrypt-hashed passwords & JWT tokens |
| 🛍️ **Shopping Cart** | Client-side cart with quantity management |
| 💳 **Checkout** | Server-validated checkout with stock & price verification |
| 📦 **Order Persistence** | Orders stored in SQLite with full audit trail |
| 🛡️ **JWT Middleware** | Protected routes that require valid Bearer tokens |

---

## 🏗 Architecture

The backend follows a **Controller-Route-Service-Repository (CRSR)** pattern, ensuring clear separation of concerns:

```
Client Request (Browser)
       │
       ▼
  server.js          ← Entry point: loads middleware, mounts routes
       │
       ▼
  routes/*.js        ← Defines URL paths & HTTP methods
       │
       ▼
  middleware/*.js     ← Cross-cutting concerns (JWT verification)
       │
       ▼
  controllers/*.js   ← Gatekeeper: validates req, orchestrates response
       │
       ▼
  services/*.js      ← Pure business logic (no HTTP, no DB)
       │
       ▼
  repositories/*.js  ← Data access layer (JSON files / SQLite)
       │
       ▼
  Data Sources       ← users.json, products.json, store.db
```

### Why This Architecture?

- **Testability** — Services contain pure logic, easily unit-tested without HTTP.
- **Swappable Data Sources** — Repositories abstract away whether data comes from JSON, SQLite, or an external API.
- **Microservice-Ready** — Each domain (Auth, Products, Checkout) can be extracted into its own service.

---

## 📁 Project Structure

```
Fruitables/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Login validation & JWT signing
│   │   ├── checkoutController.js    # Checkout orchestration
│   │   ├── productController.js     # Product query handling
│   │   └── register.js              # User registration
│   ├── routes/
│   │   ├── auth.js                  # POST /api/auth/login, /register
│   │   ├── checkout.js              # POST /api/checkout
│   │   └── products.js              # GET  /api/products
│   ├── services/
│   │   ├── authService.js           # Password verification (bcrypt)
│   │   ├── checkoutService.js       # Stock & price validation
│   │   ├── productService.js        # Product filtering logic
│   │   └── registerService.js       # Registration business rules
│   ├── repositories/
│   │   ├── authUserRepository.js    # User credential lookups
│   │   ├── orderRepository.js       # SQLite order INSERT/SELECT
│   │   ├── productRepository.js     # Product data access
│   │   └── userRepository.js        # User data access
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT Bearer token verification
│   ├── db.js                        # SQLite connection & schema init
│   ├── server.js                    # Express entry point
│   ├── products.json                # Product catalog (data source)
│   ├── users.json                   # User accounts (data source)
│   ├── store.db                     # SQLite database (orders)
│   ├── .env                         # 🔒 Local secrets (git-ignored)
│   ├── .env.example                 # Template for environment vars
│   └── package.json
│
├── frontend/
│   ├── index.html                   # Home page (hero, featured items)
│   ├── shop.html                    # Full product catalog
│   ├── cart.html                    # Shopping cart
│   ├── checkout.html                # Checkout form
│   ├── login.html                   # Login page
│   ├── register.html                # Registration page
│   ├── contact.html                 # Contact form
│   ├── css/
│   │   ├── bootstrap.min.css        # Bootstrap 5
│   │   └── style.css                # Custom styles
│   ├── js/
│   │   ├── main.js                  # Global scripts
│   │   ├── fetchProducts.js         # Product fetching & rendering
│   │   ├── cart.js                   # Cart management (localStorage)
│   │   └── checkout.js              # Checkout form submission
│   ├── img/                         # Product & UI images
│   └── lib/                         # Third-party libraries
│       ├── easing/
│       ├── lightbox/
│       ├── owlcarousel/
│       └── waypoints/
│
├── documentation/
│   └── Component Diagram.png        # System architecture diagram
│
├── .gitignore
├── changelog.md
└── README.md                        # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SuphakonCh/webtechlab01.git
cd webtechlab01

# 2. Install backend dependencies
cd backend
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and set a strong JWT_SECRET (see below)

# 4. Start the server
node server.js
```

The app will be available at **http://localhost:3000**.

---

## 🔐 Environment Variables

All configuration is managed through a `.env` file in the `backend/` directory.  
The `.env.example` file serves as a documented template.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | *(fallback)* | Secret key for signing/verifying JWT tokens |
| `JWT_EXPIRES_IN` | `2h` | Token expiration duration |
| `DB_PATH` | `./store.db` | Relative path to the SQLite database file |

### Generating a Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### How It Works

1. `server.js` calls `require('dotenv').config()` **before** any other imports.
2. Every module reads `process.env.VARIABLE_NAME` with a safe fallback default.
3. `.env` is listed in `.gitignore` — secrets never reach version control.
4. `.env.example` **is** committed — documenting what variables are needed.

---

## 📡 API Endpoints

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | ❌ | List all products (supports `?category=Fruits`) |
| `GET` | `/api/products/:id` | ❌ | Get a single product by ID |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | ❌ | Authenticate user → returns JWT |
| `POST` | `/api/auth/register` | ❌ | Create a new user account |

### Checkout

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/checkout` | ✅ JWT | Validate cart, verify stock & prices, save order |

**Auth Header Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 🛡 Security Practices

| Practice | Implementation |
|----------|----------------|
| **Password Hashing** | bcrypt with auto-generated salts |
| **JWT Authentication** | Stateless tokens with configurable expiry |
| **Generic Auth Errors** | Same 401 message for "no user" and "wrong password" — prevents user enumeration |
| **Timing-Safe Comparison** | `bcrypt.compare()` resists timing-based attacks |
| **Environment Secrets** | `.env` file + `.gitignore` — no secrets in source code |
| **Server-Side Validation** | Prices & stock verified against DB, not trusted from client |
| **Input Validation** | Controllers validate all fields before processing |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5 |
| **Backend** | Node.js, Express 5.x |
| **Database** | SQLite 3 (via `sqlite3` npm package) |
| **Auth** | JSON Web Tokens (`jsonwebtoken`), bcrypt |
| **Config** | dotenv |
| **Libraries** | Owl Carousel, Lightbox, Waypoints, jQuery Easing |

---

## 📸 Screenshots

<!-- Add your screenshots here -->
<!-- ![Home Page](./documentation/screenshots/home.png) -->
<!-- ![Shop Page](./documentation/screenshots/shop.png) -->

---

## 👤 Author

**Suphakon Ch.**  
Chiang Mai University — Web Technology Lab  
GitHub: [@SuphakonCh](https://github.com/SuphakonCh)

---

## 📄 License

This project is licensed under the **ISC License**.
