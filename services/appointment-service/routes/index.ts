/**
 * routes/index.ts
 *
 * @description :: Routes for appointments.
 * @version     :: 1.0
 */

import { Router } from 'express';
import createAppointment from '../controllers/post.controller';
import editAppointment from '../controllers/patch.controller';
import * as GET from '../controllers/get.controller';
import deleteAppointment from '../controllers/delete.controller';

const router: Router = Router();

router.get('/', GET.allAppointments);
router.get('/:id', GET.getAppointment);
router.post('/', createAppointment);
router.delete('/:id', deleteAppointment);
router.patch('/:id', editAppointment);

// Relational endpoints.
router.get('/patients/:email', GET.appointmentsByPatientId);
router.get('/dentists/:email', GET.getAppointmentsByDentistId);

export default router;
