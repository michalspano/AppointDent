import { Router } from 'express';
import { loginAdminWrapper } from '../controllers/login.controller';
import { logoutAdminWrapper } from '../controllers/logout.controller';
const router: Router = Router();

router.post('/login', loginAdminWrapper);
router.delete('/logout', logoutAdminWrapper);

export default router;
