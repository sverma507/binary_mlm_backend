const cloudinary = require('cloudinary').v2;
const Product = require('../models/addPackage');
const Poster = require('../models/poster');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const addProduct = async (req, res) => {
  console.log("addproduct=>",req.body);
  
  try {
    const { name, price, income, cycle, description, supply } = req.body;
    const img1 = req.files.img1.tempFilePath;
    // const img2 = req.files.img2.tempFilePath;

    // Upload images to Cloudinary
    const uploadImg1 = await cloudinary.uploader.upload(img1, { folder: 'products' });
    // const uploadImg2 = await cloudinary.uploader.upload(img2, { folder: 'products' });

    // Create a new product with Cloudinary image URLs
    const newProduct = new Product({
      img1: uploadImg1.secure_url,
      // img2: uploadImg2.secure_url,
      name,
      price,
      income,
      cycle,
      description,
      supply
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


const updatePoster = async (req, res) => {
  console.log("addPoster=>",req.body);
  
  try {
    const {id} = req.params;
    const { video } = req.files;
    const { title } = req.body;

    // Create a new product with Cloudinary image URLs
    const poster = await Poster.findById(id);
    const updateData = {
      video,
      title
    };

    const updatePoster = await Poster.findByIdAndUpdate(id, updateData, { new: true });

    res.status(201).json({
      message: 'Poster updated successfully',
      poster: updatePoster
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


const getAllProducts = async (req, res) => {

  
  try {
    // Fetch all products from the database
    const products = await Product.find({});
    
    res.status(200).json({
      message: 'Products retrieved successfully',
      products
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


const getPoster = async (req, res) => {
  try {
    // Fetch all products from the database
    const poster = await Poster.find({});
    
    res.status(200).json({
      message: 'Poster retrieved successfully',
      poster 
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    const img1PublicId = product.img1.split('/').pop().split('.')[0];
    const img2PublicId = product.img2.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`products/${img1PublicId}`);
    await cloudinary.uploader.destroy(`products/${img2PublicId}`);

    // Delete the product from MongoDB
    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, income, cycle, description, supply } = req.body;

    // Fetch the existing product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Prepare the data to update
    const updateData = {
      name,
      price,
      income,
      cycle,
      description,
      supply
    };

    // Handle image updates
    if (req.files && req.files.img1) {
      const img1 = req.files.img1.tempFilePath;
      const uploadImg1 = await cloudinary.uploader.upload(img1, { folder: 'products' });
      updateData.img1 = uploadImg1.secure_url;

      // Delete old image from Cloudinary
      const img1PublicId = product.img1.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`products/${img1PublicId}`);
    }

    if (req.files && req.files.img2) {
      const img2 = req.files.img2.tempFilePath;
      const uploadImg2 = await cloudinary.uploader.upload(img2, { folder: 'products' });
      updateData.img2 = uploadImg2.secure_url;

      // Delete old image from Cloudinary
      const img2PublicId = product.img2.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`products/${img2PublicId}`);
    }

    // Update the product in MongoDB
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


module.exports = {
  addProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  updatePoster,
  getPoster,
};


