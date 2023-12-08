/**
 * routes/index.ts
 *
 * @description :: Routes for appointments.
 * @version     :: 1.0
 */

import { Router } from 'express';
import GET from '../controllers/get.controller';
import createAppointment from '../controllers/post.controller';
import editAppointment from '../controllers/patch.controller';
import deleteAppointment from '../controllers/delete.controller';
import {
  subToDentist, unsubFromDentist
} from '../controllers/subscribe.controller';

const router: Router = Router();

router.get('/', GET.allAppointments);
router.get('/:id', GET.appointment);
router.post('/', createAppointment);
router.delete('/:id', deleteAppointment);
router.patch('/:id', editAppointment);

// Relational endpoints.
router.get('/admins/count', GET.appointmentCount);
router.get('/patients/:email', GET.appointmentsByPatientId);
router.get('/dentists/:email', GET.appointmentsByDentistId);

/* Relational endpoint for a patient to subscribe and unsubscribe
 * to and from a dentist. The reason why this is kept in this service
 * is, simply, that when a new appointment is created, there's a direct
 * access to this table without requesting it from another service.
 */
router.post('/subscribe/:email/:patientEmail', subToDentist);
router.delete('/subscribe/:email/:patientEmail', unsubFromDentist);

export default router;
