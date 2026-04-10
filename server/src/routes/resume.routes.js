import {Router} from 'express'
import { uploadResume, getResume } from '../controllers/resume.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import { uploadResume as multerUpload } from '../middleware/upload.middleware.js';

const router = Router() // creating an instance

router.use(authenticate) // adding middleware for all the resume routes.

router.post('/upload', multerUpload, uploadResume)
router.get('/', getResume)

export default router
 