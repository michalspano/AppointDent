import { Router } from 'express';
import * as registerController from '../controllers/register.controller';
import * as loginController from '../controllers/login.controller';
import * as updateController from '../controllers/update.controller';
import * as deleteController from '../controllers/delete.controller';

const router = Router();

router.post('/register', registerController.register);
router.post('/login', loginController.login);
router.patch('/:email', updateController.updateDentist);
router.delete('/:email', deleteController.deleteDentist);

export default router;
