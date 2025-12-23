import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler.js';

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    if (file.fieldname === 'avatar') {
      folder += 'avatars/';
    } else if (file.fieldname === 'storeLogo' || file.fieldname === 'storeBanner') {
      folder += 'vendors/';
    } else if (file.fieldname === 'productImages') {
      folder += 'products/';
    } else if (file.fieldname === 'reviewImages') {
      folder += 'reviews/';
    } else if (file.fieldname === 'categoryImage') {
      folder += 'categories/';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (jpeg, jpg, png, gif, webp)', 400));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// CSV upload for bulk products
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/csv/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'products-' + uniqueSuffix + '.csv');
  }
});

const csvFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new AppError('Only CSV files are allowed', 400));
  }
};

export const uploadCSV = multer({
  storage: csvStorage,
  fileFilter: csvFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
