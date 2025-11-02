require("dotenv").config();

const express = require("express");
const pool = require("./db"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const authorize = require("./middleware/authorize");
const cors = require("cors");

const app = express();
app.use(express.json()); // Middleware to parse JSON body
app.use(cors()); // Enable CORS for all routes

// --- ROUTES ---

app.get("/", (req, res) => {
  res.send("Inventory API is running...");
});

/*
 * @route   POST /api/auth/register
 * @desc    Register a new user (Admin-only)
 */
app.post('/api/auth/register', [auth, authorize('Admin')], async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM Users WHERE username = $1",
      [username]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: "Username already exists" });
    }

    //Get the role_id from the role name
    const roleQuery = await pool.query("SELECT id FROM Roles WHERE name = $1", [
      role,
    ]);
    if (roleQuery.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid role" });
    }
    const role_id = roleQuery.rows[0].id;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(password, salt);

    // Insert the new user
    const newUser = await pool.query(
      "INSERT INTO Users (username, hashed_password, role_id) VALUES ($1, $2, $3) RETURNING id, username, role_id",
      [username, hashed_password, role_id]
    );

    res
      .status(201)
      .json({ msg: "User created successfully", user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin Only)
app.get('/api/users', [auth, authorize('Admin')], async (req, res) => {
  try {
    const users = await pool.query(
      `SELECT u.id, u.username, r.name AS role, u.is_active, u.created_at 
       FROM Users u
       JOIN Roles r ON u.role_id = r.id
       ORDER BY u.username ASC`
    );
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route   PUT /api/users/:id
// @desc    Update a user's role or active status
// @access  Private (Admin Only)
app.put('/api/users/:id', [auth, authorize('Admin')], async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id && is_active === false) {
      return res.status(400).json({ msg: 'Admin cannot deactivate their own account.' });
    }

    // Get the role_id from the role name
    const roleQuery = await pool.query("SELECT id FROM Roles WHERE name = $1", [role]);
    if (roleQuery.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    const role_id = roleQuery.rows[0].id;

    // Update the user
    const updatedUser = await pool.query(
      `UPDATE Users 
       SET role_id = $1, is_active = $2 
       WHERE id = $3
       RETURNING id, username, role_id, is_active`,
      [role_id, is_active, id]
    );

    res.json(updatedUser.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/*
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists (and get their role)
    const userQuery = await pool.query(
      `SELECT u.id, u.username, u.hashed_password, r.name AS role 
       FROM Users u
       JOIN Roles r ON u.role_id = r.id
       WHERE u.username = $1`,
      [username]
    );

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const user = userQuery.rows[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create and sign JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role, // This is critical for RBAC!
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token }); 
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*
 * @route   GET /api/auth/me
 * @desc    Get logged-in user's info
 * @access  Private (requires token)
 */
app.get("/api/auth/me", auth, async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const userQuery = await pool.query(
      `SELECT u.id, u.username, r.name AS role 
       FROM Users u
       JOIN Roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user: userQuery.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- PROTECTED TEST ROUTES ---

// @route   GET /api/test/all
// @desc    A route any logged-in user can access
// @access  Private
app.get("/api/test/all", auth, (req, res) => {
  res.json({
    msg: `Welcome user ${req.user.id}! Your role is ${req.user.role}.`,
    user: req.user,
  });
});

// @route   GET /api/test/keeper
// @desc    A route only Keepers or Admins can access
// @access  Private (Keeper, Admin)
app.get(
  "/api/test/keeper",
  [auth, authorize("Keeper", "Admin")],
  (req, res) => {
    res.json({
      msg: "Welcome Keeper or Admin! You have special access.",
    });
  }
);

// @route   GET /api/test/admin
// @desc    A route only Admins can access
// @access  Private (Admin)
app.get("/api/test/admin", [auth, authorize("Admin")], (req, res) => {
  res.json({
    msg: "Welcome Admin! This is the top-secret area.",
  });
});

// ---------------------------
// --- INVENTORY API ROUTES ---
// ---------------------------

// @route   POST /api/items
// @desc    Create a new inventory item
// @access  Private (Admin, Keeper)
app.post(
  "/api/items",
  [auth, authorize("Admin", "Keeper")],
  async (req, res) => {
    try {
      const { sku, name, description, category_id, reorder_level, attributes } =
        req.body;
      const initial_stock = parseInt(req.body.initial_stock) || 0;

      // 1. Create the item with a stock of 0.
      // The trigger will handle setting the correct stock.
      const newItem = await pool.query(
        `INSERT INTO Items (sku, name, description, category_id, reorder_level, attributes, current_stock)
       VALUES ($1, $2, $3, $4, $5, $6, 0)
       RETURNING *`,
        [sku, name, description, category_id, reorder_level, attributes]
      );

      const createdItem = newItem.rows[0];

      // 2. If initial stock was > 0, log it in the ledger.
      // This will fire the trigger and update current_stock.
      if (initial_stock > 0) {
        await pool.query(
          `INSERT INTO InventoryTransactions (item_id, user_id, type, quantity, notes)
         VALUES ($1, $2, 'ADJUSTMENT', $3, 'Initial stock set')`,
          [createdItem.id, req.user.id, initial_stock]
        );

        // Re-fetch the item to get the stock value updated by the trigger
        const updatedItemQuery = await pool.query(
          "SELECT * FROM Items WHERE id = $1",
          [createdItem.id]
        );
        res.status(201).json(updatedItemQuery.rows[0]);
      } else {
        // If no initial stock, just return the item as-is
        res.status(201).json(createdItem);
      }
    } catch (err) {
      console.error(err.message);
      if (err.code === "23505") {
        // Unique violation (e.g., duplicate SKU)
        return res.status(400).json({ msg: "SKU already exists" });
      }
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET /api/items
// @desc    Get all inventory items
// @access  Private (Admin, Keeper, Worker)
app.get("/api/items", auth, async (req, res) => {
  try {
    // Workers can see items, too, so we just use the `auth` middleware
    const allItems = await pool.query(
      `SELECT i.*, c.name AS category_name 
       FROM Items i
       LEFT JOIN Categories c ON i.category_id = c.id
       ORDER BY i.name ASC`
    );
    res.json(allItems.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/items/:id
// @desc    Update an item (e.g., name, description, reorder level)
// @access  Private (Admin, Keeper)
app.put(
  "/api/items/:id",
  [auth, authorize("Admin", "Keeper")],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category_id, reorder_level, attributes } =
        req.body;

      const updatedItem = await pool.query(
        `UPDATE Items
       SET name = $1, description = $2, category_id = $3, reorder_level = $4, attributes = $5
       WHERE id = $6
       RETURNING *`,
        [name, description, category_id, reorder_level, attributes, id]
      );

      if (updatedItem.rows.length === 0) {
        return res.status(404).json({ msg: "Item not found" });
      }

      res.json(updatedItem.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Note: We don't create a 'DELETE' route for items.
// Why? Because it would destroy the transaction history.
// Instead, professionals 'deactivate' an item.
// (We can add an 'is_active' boolean column to Items later if needed.)

// ---------------------------------
// --- TRANSACTIONS API ROUTES ---
// ---------------------------------
// @route   GET /api/transactions
// @desc    Get all transactions (for audit log)
// @access  Private (Admin, Keeper)
app.get('/api/transactions', [auth, authorize('Admin', 'Keeper')], async (req, res) => {
  try {
    const transactions = await pool.query(
      `SELECT 
         tx.id, 
         tx.type, 
         tx.quantity, 
         tx.notes, 
         tx.created_at,
         i.name AS item_name,
         u.username AS user_name
       FROM InventoryTransactions tx
       JOIN Items i ON tx.item_id = i.id
       LEFT JOIN Users u ON tx.user_id = u.id
       ORDER BY tx.created_at DESC`
    );
    
    res.json(transactions.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route   POST /api/transactions
// @desc    Log a new stock transaction (IN/OUT/ADJUST)
// @access  Private (All roles can do this)
app.post("/api/transactions", auth, async (req, res) => {
  try {
    const { item_id, type, quantity, notes } = req.body;
    const { id: user_id } = req.user; // Get user ID from auth middleware

    // 1. Basic validation
    if (!item_id || !type || !quantity) {
      return res
        .status(400)
        .json({ msg: "Please provide item_id, type, and quantity" });
    }

    // 2. Ensure quantity is a valid number
    let tx_quantity = parseInt(quantity);
    if (isNaN(tx_quantity)) {
      return res.status(400).json({ msg: "Quantity must be a number" });
    }

    // 3. For OUTBOUND, make quantity negative
    if (type === "OUTBOUND") {
      tx_quantity = -Math.abs(tx_quantity); // Ensure it's a negative number
    } else {
      tx_quantity = Math.abs(tx_quantity); // Ensure it's a positive number
    }

    // 4. (Optional but recommended) Check for sufficient stock on OUTBOUND
    if (type === "OUTBOUND") {
      const itemQuery = await pool.query(
        "SELECT current_stock FROM Items WHERE id = $1",
        [item_id]
      );
      if (itemQuery.rows.length === 0) {
        return res.status(404).json({ msg: "Item not found" });
      }
      if (itemQuery.rows[0].current_stock < Math.abs(tx_quantity)) {
        return res.status(400).json({
          msg: `Insufficient stock. Only ${itemQuery.rows[0].current_stock} available.`,
        });
      }
    }

    // 5. Insert the transaction. The trigger will do the rest!
    const newTransaction = await pool.query(
      `INSERT INTO InventoryTransactions (item_id, user_id, type, quantity, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [item_id, user_id, type, tx_quantity, notes]
    );

    res.status(201).json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- CATEGORIES API ROUTES ---

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private (Admin, Keeper)
app.post(
  "/api/categories",
  [auth, authorize("Admin", "Keeper")],
  async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ msg: "Please provide a name" });
      }

      const newCategory = await pool.query(
        "INSERT INTO Categories (name) VALUES ($1) RETURNING *",
        [name]
      );

      res.status(201).json(newCategory.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        // Unique violation
        return res.status(400).json({ msg: "Category name already exists" });
      }
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private (All logged-in users)
app.get("/api/categories", auth, async (req, res) => {
  try {
    const allCategories = await pool.query(
      "SELECT * FROM Categories ORDER BY name ASC"
    );
    res.json(allCategories.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category name
// @access  Private (Admin, Keeper)
app.put(
  "/api/categories/:id",
  [auth, authorize("Admin", "Keeper")],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ msg: "Please provide a name" });
      }

      const updatedCategory = await pool.query(
        "UPDATE Categories SET name = $1 WHERE id = $2 RETURNING *",
        [name, id]
      );

      if (updatedCategory.rows.length === 0) {
        return res.status(404).json({ msg: "Category not found" });
      }

      res.json(updatedCategory.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(400).json({ msg: "Category name already exists" });
      }
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private (Admin, Keeper)
app.delete(
  "/api/categories/:id",
  [auth, authorize("Admin", "Keeper")],
  async (req, res) => {
    try {
      const { id } = req.params;

      const deleteOp = await pool.query(
        "DELETE FROM Categories WHERE id = $1 RETURNING *",
        [id]
      );

      if (deleteOp.rows.length === 0) {
        return res.status(404).json({ msg: "Category not found" });
      }

      res.json({ msg: "Category deleted successfully" });
    } catch (err) {
      // This is important! This error code means an item still uses this category.
      if (err.code === "23503") {
        // Foreign key violation
        return res.status(400).json({
          msg: "Cannot delete category. It is still being used by one or more items.",
        });
      }
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
