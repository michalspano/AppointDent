import { Router } from 'express';
import * as patientController from '../controllers/deletePatientController';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.loginController);
router.post('/register', patientController.registerController);
router.patch('/:email', patientController.updatePatientController);
router.delete('/:email', patientController.deletePatientController);

export default router;
