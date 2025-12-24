import fs from "fs";

import {
  _Object,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "./env";

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
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

export async function deleteAllObjectsFromS3() {
  try {
    // Step 1: List all objects
    console.log("started");

    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      })
    );

    const contents = listResponse.Contents;

    if (!contents || contents.length === 0) {
      console.log("No objects found in the bucket.");
      return;
    }

    // Step 2: Prepare objects for deletion
    const objectsToDelete = contents.map((obj: _Object) => ({ Key: obj.Key! }));

    // Step 3: Send batch delete request
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: objectsToDelete,
          Quiet: false,
        },
      })
    );

    console.log("All objects deleted successfully.");
  } catch (error) {
    console.error("Failed to delete all objects:", error);
  }
}

// deleteAllObjectsFromS3();
