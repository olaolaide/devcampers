const path = require('path')
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileUpload = require('express-fileupload')
require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error')
// Load environment variables
dotenv.config({
    path: './.env'
});

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json())

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File Upload
app.use(fileUpload())
// Set static folder
app.use(express.static(path.join(__dirname, 'public')))


// Route files
const bootcamps = require('./routes/bootcamp');
const courses = require('./routes/courses')

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use(errorHandler)


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`.red.bold);
    server.close(() => {
        process.exit(1);
    });
});
