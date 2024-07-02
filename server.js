const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');

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

// Route files
const bootcamp = require('./routes/bootcamp');

// Mount routers
app.use('/api/v1/bootcamps', bootcamp);

app.get('/', (req, res) => {
    res.json({name: 'brad'});
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`.red.bold);
    server.close(() => {
        process.exit(1);
    });
});
