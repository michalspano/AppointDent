/**
 * routes/index.ts
 *
 * @description :: Routes for admin.
 * @version     :: 1.0
 */

import { Router } from 'express';
import { addRequest } from '../controllers/post.controller';

const router: Router = Router();

// TODO: add routes here; this is just a sample route.
router.get('/', (req, res) => res.send('Admin service'));

router.post('/request', addRequest);

export default router;
