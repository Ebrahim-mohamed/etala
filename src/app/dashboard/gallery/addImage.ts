"use server";
import { uploadImage } from "@/lib/mongodb/imageUpload";

export async function addImageToDataBase({
  image,
  type,
}: {
  image: File;
  type: string;
}) {
  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (type === "Main Gallery") {
    await uploadImage({
      filename: image.name,
      contentType: image.type,
      buffer,
      type: "GALLERY",
    });
  } else if (type === "Model 1") {
    await uploadImage({
      filename: image.name,
      contentType: image.type,
      buffer,
      type: "MODEL_1",
    });
  } else if (type === "Model 2") {
    await uploadImage({
      filename: image.name,
      contentType: image.type,
      buffer,
      type: "MODEL_2",
    });
  } else if (type === "Model 3") {
    await uploadImage({
      filename: image.name,
      contentType: image.type,
      buffer,
      type: "MODEL_3",
    });
  } else if (type === "Model 4") {
    await uploadImage({
      filename: image.name,
      contentType: image.type,
      buffer,
      type: "MODEL_4",
    });
  } else if (type === "TYPE_A") {
    await uploadImage({
      filename: image.name,
      contentType: image.type,
      buffer,
      type: "TYPE_A",
    });
  } else if (type === "TYPE_B") {
    await uploadImage({
      filename: image.name,
      contentType: image.type,
      buffer,
      type: "TYPE_B",
    });
  } else if (type === "TYPE_C") {
    await uploadImage({
      filename: image.name,
      contentType: image.type,
      buffer,
      type: "TYPE_C",
    });
  } else if (type === "TYPE_D") {
    await uploadImage({
      filename: image.name,
      contentType: image.type,
      buffer,
      type: "TYPE_D",
    });
  }
}