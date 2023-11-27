import { Router } from 'express';

import { getPatientWrapper } from '../controllers/retrieve.patient.controller';
import { loginPatientWrapper } from '../controllers/login.controller';
import { registerPatientWrapper } from '../controllers/register.controller';
import { updatePatientWrapper } from '../controllers/update.patient.controller';
import { deletePatientWrapper } from '../controllers/delete.patient.controller';
import { logoutPatientWrapper } from '../controllers/logout.controller';

const router = Router();

router.post('/login', loginPatientWrapper);
router.post('/register', registerPatientWrapper);
router.delete('/logout', logoutPatientWrapper);
router.patch('/:email', updatePatientWrapper);
router.delete('/:email', deletePatientWrapper);
router.get('/:email', getPatientWrapper);

export default router;
