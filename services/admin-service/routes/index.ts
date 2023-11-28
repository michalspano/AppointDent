/**
 * routes/index.ts
 *
 * @description :: Routes for admin.
 * @version     :: 1.0
 */

import { Router } from 'express';

const router: Router = Router();

// TODO: add routes here; this is just a sample route.
router.get('/', (req, res) => res.send('Admin service'));

export default router;
