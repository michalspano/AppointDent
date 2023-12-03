import { Router } from 'express';
import { addRequest } from '../controllers/post.controller';
import { getRequest, getAllRequests } from '../controllers/get.controller';

import { loginAdminWrapper } from '../controllers/login.controller';
import { logoutAdminWrapper } from '../controllers/logout.controller';
const router: Router = Router();

router.post('/login', loginAdminWrapper);
router.delete('/logout', logoutAdminWrapper);

router.post('/requests', addRequest);
router.get('/requests/:id', getRequest);
router.get('/requests/', getAllRequests);

export default router;
