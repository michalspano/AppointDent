import { Router } from 'express';
import deleteAppointment from '../controllers/delete.controller';
import createAppointment from '../controllers/post.controller';
import editAppointment from '../controllers/patch.controller';
import * as getControllers from '../controllers/get.controller';

const router: Router = Router();

router.get('/', getControllers.getAllAppointments);
router.get('/:id', getControllers.getAppointment);
router.post('/', createAppointment);
router.delete('/:id', deleteAppointment);
router.patch('/:id', editAppointment);

export default router;
