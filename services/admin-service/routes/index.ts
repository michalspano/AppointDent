/**
 * routes/index.ts
 *
 * @description :: Routes for admin.
 * @version     :: 1.0
 */

import { Router } from 'express';
import { addRequest } from '../controllers/post.controller';
import { getRequest, getAllRequests } from '../controllers/get.controller';

const router: Router = Router();

// TODO: add routes here; this is just a sample route.
router.get('/', (req, res) => res.send('Admin service'));

router.post('/requests', addRequest);
router.get('/requests/:id', getRequest);
router.get('/requests/', getAllRequests);

export default router;
