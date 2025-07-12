import fs from "fs";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "./env";

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
  region: "auto",
  endpoint: env.CLOUDFLARE_ENDPOINT!,
});

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
    console.error(error);
  }
}

export async function deleteObject(key: string) {
  try {
    return await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (error) {
    console.error(error);
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
