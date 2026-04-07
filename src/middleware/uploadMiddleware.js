const multer = require('multer');
const { AppError } = require('../errors');
const { MAX_UPLOAD_BYTES, UPLOAD_DIR, ALLOWED_EXTENSIONS } = require('../config');
const { getExtension, sanitizeFilename } = require('../utils/fileUtils');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = getExtension(file.originalname);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new AppError('Unsupported file type. Allowed: PDF only.', 400));
    }
    return cb(null, true);
  },
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
  },
});

function uploadSingleAsync(req, res) {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

module.exports = {
  upload,
  uploadSingleAsync,
};
