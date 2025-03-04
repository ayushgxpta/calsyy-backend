const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Check for required environment variables
if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined. Make sure your .env file is set up correctly.");
    process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // Increase timeout to 5 seconds
}).then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });

// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    retailPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true } // Array of image URLs
});

const Product = mongoose.model('Product', productSchema);

// Routes

// Root route
app.get('/', (req, res) => {
    res.send('Calsyy API is running!');
});

// Fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Fetch a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // Check if the productId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add a new product
app.post('/api/products', async (req, res) => {
    try {
        const { name, retailPrice, salePrice, description, images } = req.body;

        // Validate required fields
        if (!name || !retailPrice || !salePrice || !description || !images || images.length === 0) {
            return res.status(400).json({ message: 'All fields are required, including at least one image' });
        }

        const newProduct = new Product({ name, retailPrice, salePrice, description, images });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update a product by ID
app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // Check if the productId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const { name, retailPrice, salePrice, description, images } = req.body;

        // Validate required fields
        if (!name || !retailPrice || !salePrice || !description || !images || images.length === 0) {
            return res.status(400).json({ message: 'All fields are required, including at least one image' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { name, retailPrice, salePrice, description, images },
            { new: true } // Return the updated product
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete a product by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // Check if the productId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
