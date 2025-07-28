import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

let products = [
  { id: 1, name: 'Laptop Pro', stock: 15, description: 'A powerful laptop' },
  { id: 2, name: 'Wireless Mouse', stock: 125, description: 'Ergonomic and reliable' },
  { id: 3, name: 'Mechanical Keyboard', stock: 42, description: 'Clicky and satisfying' },
];
let nextId = 4;

const router = express.Router();

// GET /
router.get('/', (req, res) => res.json(products));

// GET /:id
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  product ? res.json(product) : res.status(404).json({ message: 'Product not found' });
});

// POST /
router.post('/', (req, res) => {
  const newProduct = { id: nextId++, ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// DELETE /:id --- THE FIX IS HERE ---
router.delete('/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index > -1) {
    products.splice(index, 1);
    // Change from 204 to 200 and send a JSON body.
    res.status(200).json({ message: 'Product deleted successfully.' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Use the router with the '/products' prefix to perfectly match the gateway
app.use('/products', router);

app.listen(5001, () => {
  console.log('📦 Mock Products Service running on http://localhost:5001');
});