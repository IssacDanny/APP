import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

let users = [
  { id: 101, name: 'Alice Johnson', email: 'alice@example.com', status: 'active' },
  { id: 102, name: 'Bob Williams', email: 'bob@example.com', status: 'inactive' },
];
let nextId = 103;

const router = express.Router();

// --- DEFINE ROUTES ON THE ROUTER ---

// This now corresponds to GET /users/
router.get('/', (req, res) => res.json(users));

// This now corresponds to GET /users/activity-report
router.get('/activity-report', (req, res) => {
  res.json({
    reportId: `rep-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    activeUsers: users.filter(u => u.status === 'active').length,
    inactiveUsers: users.filter(u => u.status === 'inactive').length,
    summary: "User activity summary report."
  });
});

// This now corresponds to GET /users/:id
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  user ? res.json(user) : res.status(404).json({ message: 'User not found' });
});

// This now corresponds to POST /users/
router.post('/', (req, res) => {
  const newUser = { id: nextId++, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});


// --- THE FIX: MOUNT THE ROUTER ONLY ONCE AT THE CORRECT PREFIX ---
app.use('/users', router);

app.listen(5002, () => {
  console.log('🧑‍💻 Mock Users Service running on http://localhost:5002');
});