import dotenv from 'dotenv'
import fs from 'fs'
import AWS from 'aws-sdk'
dotenv.config()

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  region: process.env.S3_BUCKET_REGION,
})

const s3 = new AWS.S3()

const uploadFile = (req, res) => {
  const source = req.file.path
  const targetName = req.file.filename
  console.log('preparing to upload...')
  fs.readFileSync(source, function (err, filedata) {
    if (!err) {
      const putParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: targetName,
        Body: filedata,
      }
      s3.putObject(putParams, function (err, data) {
        if (err) {
          console.log('Could nor upload the file. Error :', err)
          return res.send({ success: false })
        } else {
          fs.unlink(source) // Deleting the file from uploads folder(Optional).Do Whatever you prefer.
          console.log('Successfully uploaded the file')
          return res.send({ success: true })
        }
      })
    } else {
      console.log({ err: err })
    }
  })
}

const retrieveFile = (req, res) => {
  const filename = req.params.file_name
  const getParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
  }

  s3.getObject(getParams, function (err, data) {
    if (err) {
      return res.status(400).send({ success: false, err: err })
    } else {
      var buf = Buffer.from(data.Body)
      fs.writeFileSync('downloads/image.jpg', buf)
      return res.send(data.Body)
    }
  })
}

export { retrieveFile, uploadFile }
