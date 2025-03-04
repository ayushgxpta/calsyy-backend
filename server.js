const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet'); // For setting secure HTTP headers
const morgan = require('morgan'); // For logging HTTP requests (optional)

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Check for required environment variables
if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined. Make sure your .env file is set up correctly.");
    process.exit(1);
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: '*' // Allow all origins (replace with your frontend URL in production)
}));
app.use(helmet()); // Add security headers
app.use(morgan('dev')); // Log HTTP requests (optional)

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000
}).then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });

// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    correctedPrice: { type: Number }, // Corrected price (optional)
    images: { type: [String], required: true }, // Stores product images (no limit)
    descriptionPictures: { type: [String] }, // Stores description images (no limit)
    category: { type: String, required: true },
    description: { type: String },
    miniDescription: { type: String }, // New field for mini description
    reviews: {
        customer1: { type: String },
        customer2: { type: String },
        customer3: { type: String },
        customer4: { type: String },
        customer5: { type: String },
        review1: { type: String },
        review2: { type: String },
        review3: { type: String },
        review4: { type: String },
        review5: { type: String }
    }
});

const Product = mongoose.model('Product', productSchema);

// Routes

// Add a new product
app.post('/api/products', async (req, res) => {
    try {
        const { 
            name, price, correctedPrice, images, descriptionPictures, category, description, miniDescription, 
            reviews 
        } = req.body;

        if (!Array.isArray(images) || images.length !== 5) {
            return res.status(400).json({ message: "Please provide exactly 5 product images" });
        }

        if (!Array.isArray(descriptionPictures) || descriptionPictures.length !== 3) {
            return res.status(400).json({ message: "Please provide exactly 3 description images" });
        }

        const newProduct = new Product({ 
            name, price, correctedPrice, images, descriptionPictures, category, description, miniDescription, 
            reviews 
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Fetch all products (sorted by creation date, newest first)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 });
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

// Update a product by ID
app.put('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { 
            name, price, correctedPrice, images, descriptionPictures, category, description, miniDescription, 
            reviews 
        } = req.body;

        if (images && (!Array.isArray(images) || images.length !== 5)) {
            return res.status(400).json({ message: "Please provide exactly 5 product images" });
        }

        if (descriptionPictures && (!Array.isArray(descriptionPictures) || descriptionPictures.length !== 3)) {
            return res.status(400).json({ message: "Please provide exactly 3 description images" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { name, price, correctedPrice, images, descriptionPictures, category, description, miniDescription, reviews },
            { new: true }
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

// Serve dynamic product pages
app.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Render the product page dynamically
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${product.name}</title>
            </head>
            <body>
                <h1>${product.name}</h1>
                ${product.images.map(image => `<img src="${image}" alt="${product.name}" style="max-width: 100%;">`).join('')}
                <p>${product.description || 'No description available'}</p>
                <p>Price: $${product.price}</p>
                <p>Category: ${product.category}</p>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error generating product page:', error);
        res.status(500).send('Server Error');
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Calsyy API is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
