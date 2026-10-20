import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
} from '../controllers/customerController';
import { getNotes, createNote } from '../controllers/noteController';
import { getCustomerMatches, generateMatches } from '../controllers/matchController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All customer routes are protected
router.use(authenticateToken);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.patch('/:id', updateCustomer);

// Notes sub-resource
router.get('/:id/notes', getNotes);
router.post('/:id/notes', createNote);

// Matches sub-resource
router.get('/:id/matches', getCustomerMatches);
router.post('/:id/matches/generate', generateMatches);

export default router;
