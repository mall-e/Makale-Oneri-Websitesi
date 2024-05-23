const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    similarity: {
        type: Number,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    abstract: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Article', ArticleSchema);
