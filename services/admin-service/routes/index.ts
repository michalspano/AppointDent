import { Router } from 'express';
import { loginAdminWrapper } from '../controllers/login.controller';
const router: Router = Router();

router.post('/login', loginAdminWrapper);

export default router;
