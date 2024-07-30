const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.memoryStorage(); // Stocker temporairement l'image en mémoire

const fileFilter = (req, file, callback) => {
  const extension = MIME_TYPES[file.mimetype];
  if (extension) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only JPG and PNG are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
}).single('image');

const processImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const name = req.file.originalname.replace(/ /g, '_').replace(/\//g, '_');
  const removeExtension = name.split('.')[0];
  const extension = MIME_TYPES[req.file.mimetype];
  const filename = `${removeExtension}_${Date.now()}.${extension}`;

  sharp(req.file.buffer)
    .resize(800, 800, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(path.join('images', filename), (err, info) => {
      if (err) {
        return next(err);
      }

      req.file.filename = filename;
      next();
    });
};

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    processImage(req, res, next);
  });
};
