// server/routes/api/gptthesis.js
import express from 'express';
import { generateGptThesis } from '../../controllers/gptthesis.js';

const router = express.Router();

router.get('/', generateGptThesis);

export default router;
