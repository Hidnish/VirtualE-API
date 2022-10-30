import dotenv from 'dotenv'
import util from 'util'
import fs from 'fs'
import AWS from 'aws-sdk'

dotenv.config()
const unlinkFile = util.promisify(fs.unlink)

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  region: process.env.S3_BUCKET_REGION,
})

const s3 = new AWS.S3()

const uploadFile = async (req, res) => {
  const source = req.file.path
  const targetName = req.file.filename

  try {
    const myStream = fs.createReadStream(source)
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: targetName,
      Body: myStream,
    }
    //  Why I replaced putObject with upload
    //  https://stackoverflow.com/questions/38442512/difference-between-upload-and-putobject-for-uploading-a-file-to-s3
    const result = await s3.upload(uploadParams).promise()
    await unlinkFile(source)

    return res.send({ fileKey: result.Key })
  } catch (err) {
    return res.send({ success: false, err: err })
  }
}

const retrieveFile = (req, res) => {
  const filename = req.params.file_name
  const getParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
  }

  try {
    const readStream = s3.getObject(getParams).createReadStream()
    readStream.pipe(res)
  } catch (err) {
    return res.status(400).send({ success: false, err: err })
  }
}

export { retrieveFile, uploadFile }
