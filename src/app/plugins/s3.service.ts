import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private s3: S3Client;
  constructor() {
    this.s3 = new S3Client({
      region: 'default',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });
  }

  async upload(file: Express.Multer.File, rootName:string) {
    let ext = extname(file.originalname);
    let params: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${rootName}/${Date.now().toString()}${ext}`,
    };
    try {
      await this.s3.send(new PutObjectCommand(params));

      return {
        Url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${params.Key}`,
        key: params.Key,
      };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
  async delete(key: string) {
    const params: DeleteObjectCommandInput = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };
    try {
      return this.s3.send(new DeleteObjectCommand(params));
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete object from S3');
    }
  }
}