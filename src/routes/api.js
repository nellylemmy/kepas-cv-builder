import { Router } from 'express';
import { createCV, getCV, updateCV, deleteCV } from '../controllers/cvController.js';

const router = Router();

router.post('/', createCV);
router.get('/:shareCode', getCV);
router.put('/:shareCode', updateCV);
router.delete('/:shareCode', deleteCV);

export default router;
