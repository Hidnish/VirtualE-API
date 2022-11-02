import { Router } from 'express'
import { retrieveFile, uploadFile } from '../controllers/s3.controller.js'
import { upload } from '../middlewares/s3Multer.js'

const router = Router()

router.post('/post_file', upload.single('demo_file'), uploadFile)
router.get('/get_file/:file_name', retrieveFile)

export default router
