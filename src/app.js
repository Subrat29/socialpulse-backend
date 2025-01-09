require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const flowRoutes = require('./routes/flowRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', flowRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send('Langflow Integration API is running.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
