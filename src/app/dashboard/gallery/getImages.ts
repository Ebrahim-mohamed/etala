import { getAllImagesByType } from "@/lib/mongodb/imageUpload";
import { IImage } from "@/models/generalGallery";

export async function getImagesFromDataBase({
  setImage,
  type,
}: {
  setImage: (images: IImage[]) => void;
  type: string;
}) {
  if (type === "Main Gallery")
    await getAllImagesByType("GALLERY").then((data) => setImage(data));
  else if (type === "Model 1")
    await getAllImagesByType("MODEL_1").then((data) => setImage(data));
  else if (type === "Model 2")
    await getAllImagesByType("MODEL_2").then((data) => setImage(data));
  else if (type === "Model 3")
    await getAllImagesByType("MODEL_3").then((data) => setImage(data));
  else if (type === "Model 4")
    await getAllImagesByType("MODEL_4").then((data) => setImage(data));
  else if (type === "TYPE_A")
    await getAllImagesByType("TYPE_A").then((data) => setImage(data));
  else if (type === "TYPE_B")
    await getAllImagesByType("TYPE_B").then((data) => setImage(data));
  else if (type === "TYPE_C")
    await getAllImagesByType("TYPE_C").then((data) => setImage(data));
  else if (type === "TYPE_D")
    await getAllImagesByType("TYPE_D").then((data) => setImage(data));
}