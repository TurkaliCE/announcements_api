const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true, // Boşlukları kaldırır
        minlength: 3,
        maxlength: 100
    },
    content: {
        type: String,
        required: true,
        minlength: 10
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // Kullanıcı ID referansı
        ref: 'User', // 'User' modeline referans
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    viewCount: {
        type: Number,
        default: 0
    }
});

// Veri tabanı modeli
const announcementModel = mongoose.model('announcement', announcementSchema);

module.exports = announcementModel