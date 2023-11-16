import { Router } from 'express';
import createAppointment from '../controllers/post.controller';
import editAppointment from '../controllers/patch.controller';
import * as getControllers from '../controllers/get.controller';
import * as deleteControllers from '../controllers/delete.controller';

const router: Router = Router();

router.get('/', getControllers.getAllAppointments);
router.get('/:id', getControllers.getAppointment);
router.post('/', createAppointment);
router.delete('/', deleteControllers.deleteAllAppointments);
router.delete('/:id', deleteControllers.deleteAppointment);
router.patch('/:id', editAppointment);

export default router;
