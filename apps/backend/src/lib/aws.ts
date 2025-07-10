import fs from "fs";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.AWS_ENDPOINT!,
});

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//   secretAccessKey:
//     process.env.AWS_SECRET_ACCESS_KEY!,
//   endpoint: process.env.AWS_ENDPOINT!,
// });
const bucketName = "racle";

export async function uploadFileToS3(fileName: string, localFilePath: string) {
  try {
    const fileContent = fs.readFileSync(localFilePath);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName.replaceAll(`\\`, "/"),
        Body: fileContent,
      })
    );
  } catch (error) {
    console.error(error);
  }
}
export async function getS3Object(key: string) {
  try {
    return await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (error) {
    console.error(error, "for key", key);
  }
}

export async function getContent(id: string, filePath: string) {
  return await s3.send(
    new GetObjectCommand({
      Bucket: "vercel",
      Key: `dist/${id}${filePath}`,
    })
  );
}
