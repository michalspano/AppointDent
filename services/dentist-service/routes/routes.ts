import { Router } from 'express';
import { retrieveAllDentistWrapper, retrieveDentistWrapper } from '../controllers/retrieve.controller';
import { deleteDentistWrapper } from '../controllers/delete.controller';
import { loginDentistWrapper } from '../controllers/login.controller';
import { registerDentistWrapper } from '../controllers/register.controller';
import { updateDentistWrapper } from '../controllers/update.controller';

const router = Router();

router.post('/register', registerDentistWrapper);
router.post('/login', loginDentistWrapper);
router.patch('/:email', updateDentistWrapper);
router.delete('/:email', deleteDentistWrapper);
router.get('/:email', retrieveDentistWrapper);
router.get('/', retrieveAllDentistWrapper);

export default router;
