// server.js
console.log('server.js loaded — starting app');

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// simple request logger to help debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

function compute(op, operands) {
  if (!Array.isArray(operands) || operands.length === 0) {
    throw new Error('operands must be a non-empty array of numbers');
  }

  const nums = operands.map((n) => {
    if (typeof n !== 'number') throw new Error('all operands must be numbers');
    if (!isFinite(n)) throw new Error('operands must be finite numbers');
    return n;
  });

  switch (op) {
    case 'add': return nums.reduce((a, b) => a + b, 0);
    case 'sub': return nums.reduce((a, b) => a - b);
    case 'mul': return nums.reduce((a, b) => a * b, 1);
    case 'div':
      return nums.reduce((a, b) => {
        if (b === 0) throw new Error('division by zero');
        return a / b;
      });
    case 'pow':
      if (nums.length !== 2) throw new Error('pow requires exactly 2 operands');
      return Math.pow(nums[0], nums[1]);
    case 'sqrt':
      if (nums.length !== 1) throw new Error('sqrt requires 1 operand');
      if (nums[0] < 0) throw new Error('cannot take sqrt of negative number');
      return Math.sqrt(nums[0]);
    case 'avg': return nums.reduce((a, b) => a + b, 0) / nums.length;
    default: throw new Error('unknown operation: ' + op);
  }
}

app.post('/api/compute', (req, res) => {
  const { op, operands } = req.body;
  if (!op) return res.status(400).json({ error: 'missing op field' });

  try {
    const result = compute(op, operands);
    return res.json({ result });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Calculator backend is running. POST /api/compute'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on http://0.0.0.0:${PORT}`));
