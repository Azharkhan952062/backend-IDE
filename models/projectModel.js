const mongoose = require("mongoose");

let projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    projectLanguage: {
        type: String,
        required: true,
        enum: ["python", "java", "javascript", "c++", "c", "go", "bash"]
    },
    code: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    version: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("project", projectSchema);