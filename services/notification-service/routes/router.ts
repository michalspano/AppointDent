import { Router } from 'express';
import { getNotifications } from '../controllers/getController';
import { deleteAllNotification, deleteNotification } from '../controllers/deleteController';

export const router = Router();

router.get('/:email', getNotifications);
router.delete(':email/:id', deleteNotification);
router.delete('/:email', deleteAllNotification);
