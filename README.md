
-----

# StockTrack: Full-Stack Inventory Management System

StockTrack is a complete, role-based inventory management system built with a **PERN (PostgreSQL, Express, React, Node.js)** stack. It features a secure, auditable, ledger-based architecture and a modern, responsive UI built with Tailwind CSS.

This project is designed to be a professional-grade, portfolio-ready application demonstrating full-stack development principles, including JWT authentication, role-based access control (RBAC), and clean API design.

<br>

> **Note:** This is the main showcase\! I recommend creating a short GIF (you can use [GIPHY Capture](https://giphy.com/apps/giphycapture) or similar) showing you logging in, adding an item, and seeing the dashboard update. Then, replace the line below.

<br>

## 📋 Table of Contents

  * [🚀 Features](#-features)
  * [📸 Screenshots](#-screenshots)
  * [🛠️ Tech Stack](#-tech-stack)
  * [📦 Setup and Installation](#-setup-and-installation)
  * [📡 API Endpoints](#-api-endpoints)
  * [🛣️ Future Roadmap](#-future-roadmap)

-----

## 🚀 Features

  * **Secure JWT Authentication:** A complete login and registration flow using signed JSON Web Tokens stored in `localStorage`.
  * **Role-Based Access Control (RBAC):** The application has three distinct roles with granular permissions:
      * 👑 **Admin:** Full access. Can create, read, update, and deactivate items, categories, and other users.
      * 🧑‍💼 **Keeper:** Can manage inventory (items, categories, transactions) but cannot manage users.
      * 👷 **Worker:** Can view inventory and log new stock transactions (in/out) but cannot edit, create, or delete items.
  * **Dynamic Dashboard:** A high-level overview of key stats, including total items, total stock, and a "Low Stock" report (visible to Keepers/Admins).
  * **Full CRUD Functionality:** Admins and Keepers have full (soft) delete capabilities for Items, Categories, and Users.
  * **Ledger-Based Transaction System:** Every stock change is an immutable transaction, providing a perfect audit trail. The `current_stock` is automatically calculated by a **PostgreSQL Trigger**.
  * **Clean, Reusable UI:** Built with React components, Tailwind CSS, and Framer Motion for animations.

-----

## 📸 Screenshots

*(Add your own screenshots here\!)*

| Login Page | Dashboard (Admin View) |
| :---: | :---: |
|  |

[Image of the Admin Dashboard]
|
| **Inventory Page** | **User Management (Admin Only)** |
|  |  |

-----

## 🛠️ Tech Stack

### Backend (PERN)

  * **PostgreSQL:** For robust, ACID-compliant relational data.
  * **Express.js:** As the web server framework for Node.js.
  * **Node.js:** For the runtime environment.
  * **Core Libraries:**
      * `jsonwebtoken` & `bcryptjs`: For authentication and password hashing.
      * `pg`: For connecting to the PostgreSQL database.
      * `cors`: To handle cross-origin requests from the frontend.

### Frontend (Vite + React)

  * **Vite:** As the high-performance build tool and dev server.
  * **React.js:** For building the user interface.
  * **React Router DOM:** For client-side, protected routing.
  * **Tailwind CSS:** For all utility-first styling.
  * **Axios:** For making clean, interceptor-based requests to the backend API.
  * **Framer Motion:** For subtle page and modal animations.
  * **React Context API:** For global state management (authentication).

-----

## 📦 Setup and Installation

### Prerequisites

  * Node.js (v18 or later)
  * PostgreSQL
  * Git
  * A code editor (like VS Code)
  * A database GUI (like pgAdmin)

### 1\. Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/StockTrack.git
    cd StockTrack/backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up the Database:**
      * Open `pgAdmin` and create a new database. Name it `inventory_db`.
      * Run the SQL scripts in our chat history to create all tables (`Roles`, `Users`, `Categories`, `Items`, `InventoryTransactions`) and the `update_stock_count()` trigger.
4.  **Create your Environment File:**
      * In the `/backend` folder, create a new file named `.env`.
      * Add your database credentials and a JWT secret:
    <!-- end list -->
    ```ini
    # Server Port
    PORT=5000

    # PostgreSQL Database Connection
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=your_postgres_password
    DB_NAME=inventory_db

    # JSON Web Token Secret
    JWT_SECRET=this_is_a_very_secret_key_for_my_app
    ```
5.  **Run the backend server:**
    ```bash
    npm start
    ```
    The server should be running on `http://localhost:5000`.

### 2\. Frontend Setup

1.  **Open a new terminal.**
2.  **Navigate to the frontend folder:**
    ```bash
    cd ../frontend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the frontend server:**
    ```bash
    npm run dev
    ```
    The React application should open on `http://localhost:5173`.

-----

## 📡 API Endpoints

This is a comprehensive list of all API endpoints. *All routes (except `/login`) are protected and require a valid `x-auth-token` header.*

\<details\>
\<summary\>\<strong\>Click to expand/collapse the full API list\</strong\>\</summary\>

<br>

### Authentication

  * `POST /api/auth/register`: Create a new user (Admin only).
  * `POST /api/auth/login`: Log in to get a JWT.
  * `GET /api/auth/me`: Get the currently logged-in user's data.

### Items

  * `POST /api/items`: Create a new item (Admin/Keeper).
  * `GET /api/items`: Get all *active* items (All users).
  * `PUT /api/items/:id`: Update an item's details (Admin/Keeper).
  * `PUT /api/items/:id/deactivate`: Deactivate (soft delete) an item (Admin/Keeper).

### Transactions

  * `POST /api/transactions`: Log a new transaction (All users).
  * `GET /api/transactions`: Get the full transaction history (Admin/Keeper).
  * `GET /api/transactions?limit=5`: Get the 5 most recent transactions (Admin/Keeper).

### Categories

  * `POST /api/categories`: Create a new category (Admin/Keeper).
  * `GET /api/categories`: Get all categories (All users).
  * `PUT /api/categories/:id`: Update a category (Admin/Keeper).
  * `DELETE /api/categories/:id`: Delete a category (Admin/Keeper).

### Users (Admin Only)

  * `GET /api/users`: Get a list of all users.
  * `PUT /api/users/:id`: Update a user's role or active status.

### Dashboard

  * `GET /api/stats/summary`: Get summary cards for the dashboard (All users).
  * `GET /api/reports/low-stock`: Get a list of low-stock items (Admin/Keeper).

\</details\>

-----

## 🛣️ Future Roadmap

This project is feature-complete, but here are some ideas for future expansion:

  * [ ] **Deployment:** Deploy the backend to Render/Heroku and the frontend to Vercel/Netlify.
  * [ ] **Reporting & Charts:** Add a dedicated "Reports" page with visual charts (e.g., using Chart.js) for stock value over time.
  * [ ] **Email Alerts:** Create a cron job to check for low-stock items and send an email alert.
  * [ ] **Barcode Scanning:** Integrate a library like `react-qr-scanner` to allow workers to scan items.
  * [ ] **File Uploads:** Allow users to upload images for inventory items.