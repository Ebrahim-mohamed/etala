"use server";
import {Readable} from "stream";
import {ObjectId} from "mongodb";
import mongoose from "mongoose";
import getGridFSBucket from "./gridfs";
import GeneralImageModel, {IImage} from "../../models/generalGallery";
import connectMongoDB from "@/lib/mongodb/connection";

export interface UploadImageParams {
  filename: string;
  contentType: string;
  buffer: Buffer;
  metadata?: Record<string, unknown>;
  type: "GALLERY" | "MODEL_1" | "MODEL_2" | "MODEL_3" | "MODEL_4" | "TYPE_A" | "TYPE_B" | "TYPE_C" | "TYPE_D";
}

export type ImageType =
  | "GALLERY"
  | "MODEL_1"
  | "MODEL_2"
  | "MODEL_3"
  | "MODEL_4"
  | "TYPE_A"
  | "TYPE_B"
  | "TYPE_C"
  | "TYPE_D";

/**
 * Upload an image to GridFS and save metadata to the Image collection
 */
export const uploadImage = async ({
  filename,
  contentType,
  buffer,
  type,
  metadata = {},
}: UploadImageParams): Promise<IImage> => {
  const bucket = await getGridFSBucket();
  console.log(`bucket : ${bucket}`);
  // Create a readable stream from the buffer
  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null); // Signal the end of the stream

  // Create an upload stream to GridFS
  const uploadStream = bucket?.openUploadStream(filename, {
    contentType,
    metadata,
  });

  // Pipe the readable stream to the upload stream
  const uploadPromise = new Promise<ObjectId>((resolve, reject) => {
    readableStream
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => {
        resolve(uploadStream.id);
      });
  });

  // Wait for the upload to finish
  const fileId = (await uploadPromise)._id.toHexString();
  console.log("fileId after upload" , fileId)

  // Create a new image document with metadata
  const image = new GeneralImageModel({
    filename,
    contentType,
    size: buffer.length,
    uploadDate: new Date(),
    type: type,
    metadata,
    fileId,
  });

  // Save the image document
  // await image.save();
  return await GeneralImageModel.create(image);
};

/**
 * Retrieve an image from GridFS by fileId
 */
export const getImageById = async (
  fileId: string
): Promise<string> => {
  const bucket = await getGridFSBucket();
  console.log("fileid" , fileId)
  console.log("type of fileid" , typeof fileId)
  const id = new mongoose.Types.ObjectId(fileId);

  return new Promise<string>((resolve, reject) => {
    const chunks: unknown[] = [];
    const downloadStream = bucket?.openDownloadStream(id);

    downloadStream?.on("data", (chunk) => {
      chunks.push(chunk);
    });

    downloadStream?.on("error", (error) => {
      reject(error);
    });

    downloadStream?.on("end", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString("base64"));
    });
  });
};

/**
 * Delete an image from GridFS and remove its metadata from the database
 */
export const deleteImage = async (fileId: string): Promise<void> => {
  const bucket = await getGridFSBucket();
  const id = new mongoose.Types.ObjectId(fileId);
  // Delete the file from GridFS
  await bucket?.delete(id);

  // Delete the metadata from the Image collection
  await GeneralImageModel.deleteOne({ fileId: id });
};

export const getAllImagesByType = async (
  type: ImageType
): Promise<IImage[]> => {
  await connectMongoDB()
  return GeneralImageModel.find({type}).sort({uploadDate: -1})
      .then(value =>
          value.map(image => {
            console.log("typeof fid: ", typeof image.fileId as string)
            return {
              filename: image.filename,
              contentType: image.contentType,
              size: image.size,
              uploadDate: image.uploadDate,
              metadata: image.metadata,
              fileId: (image.fileId as unknown as ObjectId).toHexString(),
              type: image.type,
            } as IImage;
          }));
};