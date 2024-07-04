const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
            maxlength: [50, 'Name can not be more than 50 characters']
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description can not be more than 500 characters']
        },
        weeks: {
            type: String,
            required: [true, 'Please add number of weeks'],
        },
        tuition: {
            type: Number,
            required: [true, 'Please add a tuition cost'],
        },
        minimumSkill: {
            type: String,
            required: [true, 'Please add a tuition cost'],
            enum: ['beginner', 'intermediate', 'advanced']
        },
        scholarshipAvailable: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        bootcamp: {
            type: mongoose.Schema.ObjectId,
            ref: 'Bootcamp',
            required: true
        }
    }
);

// Static method to get the average cost of tuition
CourseSchema.statics.getAverageCost = async function (bootcampId) {
    const obj = await this.aggregate([
        {$match: {bootcamp: bootcampId}},
        {
            $group: {
                _id: '$bootcamp',
                averageCost: {$avg: '$tuition'}
            }
        }
    ]);
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        });
    } catch (error) {
        console.error(error);
    }
};

CourseSchema.post('save', function () {
    this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre('remove', function (next) {
    this.constructor.getAverageCost(this.bootcamp);
    next();
});

module.exports = mongoose.model('Course', CourseSchema);
