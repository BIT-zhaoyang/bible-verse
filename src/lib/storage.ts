import "server-only";

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { appConfig } from "./config";

type UploadInput = {
  key: string;
  body: Buffer | string;
  contentType: string;
};

type UploadResult = {
  url: string;
  provider: "local" | "r2";
};

function getPublicUrl(relativePath: string) {
  return new URL(relativePath, appConfig.siteUrl).toString();
}

function getR2Client() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } =
    process.env;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    return null;
  }

  return new S3Client({
    region: process.env.R2_REGION ?? "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

async function uploadLocal({ key, body }: UploadInput): Promise<UploadResult> {
  const relativePath = `generated/${key}`;
  const outputPath = path.join(process.cwd(), "public", relativePath);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, body);

  return {
    provider: "local",
    url: getPublicUrl(`/${relativePath}`),
  };
}

async function uploadR2(input: UploadInput): Promise<UploadResult> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET;

  if (!client || !bucket) {
    return uploadLocal(input);
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const baseUrl =
    process.env.R2_PUBLIC_BASE_URL ??
    `https://${bucket}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  return {
    provider: "r2",
    url: `${baseUrl.replace(/\/$/, "")}/${input.key}`,
  };
}

export async function uploadAsset(input: UploadInput) {
  return uploadR2(input);
}
