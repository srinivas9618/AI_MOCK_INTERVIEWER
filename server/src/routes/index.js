/* flow: 
api request -> server ->  main route -> appropriate sub route -> appropriate controller
*/

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import interviewRoutes from './interview.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);

export default router;