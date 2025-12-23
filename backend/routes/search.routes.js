import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { searchProducts, getSearchSuggestions } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/', optionalAuth, searchProducts);
router.get('/suggestions', getSearchSuggestions);

export default router;
