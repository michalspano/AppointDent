import { Router } from 'express';
import * as controllers from '../controllers/appointments';

const router: Router = Router();

router.get('/', controllers.getAllAppointments);
router.get('/:id', controllers.getAppointment);
router.post('/', controllers.createAppointment);
router.delete('/:id', controllers.deleteAppointment);
router.patch('/:id', controllers.editAppointment);

export default router;