import { Router } from 'express';
import {
  getMatchById,
  generateDraft,
  sendMatch,
} from '../controllers/matchController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/:id', getMatchById);
router.post('/:id/draft', generateDraft);
router.post('/:id/send', sendMatch);

export default router;
