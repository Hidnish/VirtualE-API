import multer from 'multer'

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})
const upload = multer({ storage: storage })

const downloaded = multer.diskStorage({
  destination: 'downloads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})
const download = multer({ storage: downloaded })

export { upload, download }
