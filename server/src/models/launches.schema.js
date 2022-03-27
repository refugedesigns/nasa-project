const mongoose = require("mongoose")

const launchSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    },
    launchDate: {
        type: Date,
        required: [true, "please provide date field"]
    },
    mission: {
        type: String,
        required: [true, "mission is required"]
    },
    rocket: {
        type: String,
        required: [true, 'rocket field required!']
    },
    target: {
        ref: 'Planet',
        type: mongoose.ObjectId,
        required: [true, 'target field is required!']
    },
    customers: {
        type: [String],
        required: true
    },
    upcoming: {
        type: Boolean,
        required: true,
        default: true
    },
    success: {
        type: Boolean,
        required: true,
        default: true
    }

}, { timestamps: true})

module.exports = mongoose.model("Launch", launchSchema)