const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined. Make sure your .env file is set up correctly.");
    process.exit(1);
}

app.use(express.json());
app.use(cors());

mongoose.connect(MONGODB_URI, {
}).then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    category: String
});

const Product = mongoose.model('Product', productSchema);

// Add a new product
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, image, category } = req.body;
        const newProduct = new Product({ name, price, image, category });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server Error');
    }
});

app.get('/', (req, res) => {
    res.send('Calsyy API is running!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
