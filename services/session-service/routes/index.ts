import { Router } from 'express';
import { whoisWrapper } from '../controllers/whois.controller';

const router: Router = Router();

router.get('/whois', whoisWrapper);

export default router;
