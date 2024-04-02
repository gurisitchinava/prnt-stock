const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const orders = []; // Array to store orders

app.use(express.static(path.join(__dirname, 'frontend')));

app.post('/add-order', async (req, res, next) => {
  const { productName, category, status, description, price, quantity } =
    req.body;
  const newOrder = {
    id: uuidv4(),
    productName,
    category,
    status,
    description,
    price,
    quantity,
  };
  orders.push(newOrder);
  res.json(newOrder);
});

app.get('/orders', async (req, res, next) => {
  res.json(orders);
});

app.get('/order/:id', async (req, res, next) => {
  const { id } = req.params;
  const order = orders.find((o) => o.id === id);
  if (!order) {
    res.status(404).json({
      message: 'status not found',
    });
    return;
  }
  res.json(order);
});

app.put('/edit-order/:id', async (req, res, next) => {
  const { id } = req.params;
  const { productName, category, status, description, price, quantity } =
    req.body;
  const orderIndex = orders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    res.status(404).json({
      message: 'status not found',
    });
    return;
  }
  orders[orderIndex] = {
    ...orders[orderIndex],
    productName,
    category,
    status,
    description,
    price,
    quantity,
  };
  res.json(orders[orderIndex]);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
