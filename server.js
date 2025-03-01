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

app.get('/', (req, res) => {
    res.send('Calsyy API is running!');
});

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});