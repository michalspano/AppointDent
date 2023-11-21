import { Router } from 'express';
import * as registerController from '../controllers/register.controller';
import * as loginController from '../controllers/login.controller';
import * as updateController from '../controllers/update.controller';
import * as deleteController from '../controllers/delete.controller';

const router = Router();

router.post('/register', registerController.registerDentistWrapper);
router.post('/login', loginController.loginDentistWrapper);
router.patch('/:email', updateController.updateDentistWrapper);
router.delete('/:email', deleteController.deleteDentistWrapper);

export default router;
