const BootCamp = require('../models/Bootcamp')

// Get all bootcamps
exports.getBootCamps = async (req, res) => {
    try {
        const bootcamps = await BootCamp.find();
        res.status(200).json({success: true, data: bootcamps});
    } catch (err) {
        res.status(400).json({success: false, error: err.message});
    }
};

// Get single bootcamp by ID
exports.getBootCamp = async (req, res) => {
    try {
        const bootcamp = await BootCamp.findById(req.params.id);
        if (!bootcamp) {
            return res.status(404).json({success: false, error: 'Bootcamp not found'});
        }
        res.status(200).json({success: true, data: bootcamp});
    } catch (err) {
        res.status(400).json({success: false, error: err.message});
    }
};

// @desc Create a new bootcamp
exports.createBootCamp = async (req, res) => {
    try {
        const bootcamp = await BootCamp.create(req.body);
        res.status(201).json({success: true, data: bootcamp});
    } catch (err) {
        res.status(400).json({success: false, error: err.message});
    }
};

// Update bootcamp by ID
exports.updateBootCamp = async (req, res) => {
    try {
        const bootcamp = await BootCamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!bootcamp) {
            return res.status(404).json({success: false, error: 'Bootcamp not found'});
        }
        res.status(200).json({success: true, data: bootcamp});
    } catch (err) {
        res.status(400).json({success: false, error: err.message});
    }
};

// Delete bootcamp by ID
exports.deleteBootCamp = async (req, res) => {
    try {
        const bootcamp = await BootCamp.findByIdAndDelete(req.params.id);
        if (!bootcamp) {
            return res.status(404).json({success: false, error: 'Bootcamp not found'});
        }
        res.status(200).json({success: true, data: {}});
    } catch (err) {
        res.status(400).json({success: false, error: err.message});
    }
};
