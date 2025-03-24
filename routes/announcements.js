const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const Announcement = require('../models/announcement')
const mongoose = require('mongoose');

//DB içinden user isim ve soyismi almak için --------------------------------------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { collection: 'users' }); 

const User = mongoose.model('User', userSchema);

// POST ve PUT için antiscript ---------------------------------------------------------
const sanitizeContent = (value) => {
  return sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br'], 
      allowedAttributes: {'a': ['href', 'target'],}, 
  });
};

//oluştur ------------------------------------
router.post('/', 
  [
    body('title')
        .isString()
        .withMessage('Title must be a string.')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Başlık 3 ve 100 karakter arası olmalıdır.')
        .escape(), 
    body('content')
        .isString()
        .withMessage('Title must be a string.')
        .trim()
        .isLength({ min: 10, max: 5000 })
        .withMessage('Konu 10 ve 5000 karakter arası olmalıdır.')
        .customSanitizer(sanitizeContent), 
    body('author')
        .trim()
        .isMongoId()
        .withMessage('Invalid author ID.'), 
],
  async (req, res) => {
  try {
      const { title, content, author } = req.body;



      const newAnnouncement = new Announcement({
          title,
          content,
          author,
      });

      await newAnnouncement.save();
      res.status(201).json(newAnnouncement);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});


//hepsini al --------------------------------------------------
router.get('/', async (req, res) => {
  try {
      const announcements = await Announcement.find().select('-isPublished -__v -_id').populate('author', 'name surname');
      res.json(announcements);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

//id ile al -------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
      const announcement = await Announcement.findById(req.params.id).select('-isPublished -__v -_id').populate('author', 'name surname -_id');
      if (!announcement) return res.status(404).json({ error: 'Duyuru bulunamadı' });
      await Announcement.findByIdAndUpdate(req.params.id, {
        $inc:{viewCount: 1}
      })
      res.json(announcement);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

//güncelle ---------------------------------------------------------------
router.put('/:id',
  [
    body('title').optional().trim().isLength({ min: 3, max: 100 }).escape(),
    body('content').optional().trim().customSanitizer(sanitizeContent),
  ],
  async (req, res) => {
  try {
      const updatedAnnouncement = await Announcement.findByIdAndUpdate(
          req.params.id,
          { ...req.body, updatedAt: Date.now() },
          { new: true, runValidators: true }
      );

      if (!updatedAnnouncement) return res.status(404).json({ error: 'Duyuru bulunamadı' });

      res.json(updatedAnnouncement);
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});


//sil --------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
      const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
      if (!deletedAnnouncement) return res.status(404).json({ error: 'Duyuru bulunamadı' });

      res.json({ message: 'Duyuru Silindi' });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


//export ---------------------------------------------------------------
module.exports = router;