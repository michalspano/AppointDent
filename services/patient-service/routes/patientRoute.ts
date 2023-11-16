/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as registerController from '../controllers/registerController';
import * as deletePatientController from '../controllers/deletePatientController';
import * as updatePatientController from '../controllers/updatePatientController';

const router = Router();

router.post('/login', authController.loginController);
router.post('/register', registerController.registerController);
router.patch('/:email', updatePatientController.updatePatientController);
router.delete('/:email', deletePatientController.deletePatientController);

export default router;
