import { Router } from 'express';
import * as controllers from '../controllers/controllers';

const router = Router();

router.post('/register', controllers.registerController);
router.post('/login', controllers.loginController);
router.patch('/:email', controllers.updateDentistController);
router.delete('/:email', controllers.deleteDentistController);

export default router;
