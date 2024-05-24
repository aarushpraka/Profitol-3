const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blogDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Define schema and model for the blog
const blogSchema = new mongoose.Schema({
    image: String,
    title: String,
    content: String
});

const Blog = mongoose.model('Blog', blogSchema);

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
}).single('blogImage');

// Handle POST request to submit blog
app.post('/submitBlog', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error uploading file');
        }

        // Create new blog object
        const newBlog = new Blog({
            image: req.file.filename,
            title: req.body.blogTitle,
            content: req.body.blogContent
        });

        // Save to database
        newBlog.save((err, blog) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving blog to database');
            }
            res.send('Blog submitted successfully!');
        });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));