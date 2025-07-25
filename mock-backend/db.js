// mock-backend/db.js

// In-memory "database"
let db = {
  products: [
    { id: 1, name: 'Wireless Mouse', stock: 150, category: 'Electronics' },
    { id: 2, name: 'Mechanical Keyboard', stock: 75, category: 'Electronics' },
    { id: 3, name: 'USB-C Hub', stock: 200, category: 'Accessories' },
  ],
  orders: [
    { id: 'ORD-1001', customerName: 'Alice Johnson', amount: 125.50, status: 'Shipped' },
    { id: 'ORD-1002', customerName: 'Bob Williams', amount: 45.00, status: 'Processing' },
  ],
  posts: [
    { id: 'post-001', title: 'Welcome to the New Admin Panel', authorId: 'auth-01' },
    { id: 'post-002', title: 'A Guide to Our Services', authorId: 'auth-02' },
  ],
  authors: [
    { id: 'auth-01', name: 'Jane Doe', email: 'jane.doe@example.com' },
    { id: 'auth-02', name: 'John Smith', email: 'john.smith@example.com' },
  ],
  pages: [
    { id: 'about-us', title: 'About Us', content: '<h1>Our Company</h1><p>We are dedicated to providing the best services.</p>' },
    { id: 'contact', title: 'Contact Page', content: '<h1>Get in Touch</h1><p>Email us at contact@example.com.</p>' },
  ],
  users: [
    { id: 'user-123', name: 'Admin User', email: 'admin@corp.com', role: 'Administrator' }
  ],
};

// ID counters for creating new items
let idCounters = {
  products: 4,
  posts: 3,
  authors: 3,
  pages: 3,
};

// Helper function to get the next ID for a given resource type
const getNextId = (resource) => {
  if (resource === 'orders') {
    // Orders have string IDs
    const lastId = Math.max(...db.orders.map(o => parseInt(o.id.split('-')[1])));
    return `ORD-${lastId + 1}`;
  }
  return idCounters[resource]++;
};

module.exports = { db, getNextId };