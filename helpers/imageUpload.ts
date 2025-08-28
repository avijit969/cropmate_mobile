import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";

const uploadImage = async (image: string, folder: string): Promise<string> => {
  try {
    const extension = image.split(".").pop() || "jpg";
    const filePath = `${folder}/${Date.now()}.${extension}`;
    const contentType = `image/${extension}`;
    const base64 = await FileSystem.readAsStringAsync(image, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const { data, error: uploadError } = await supabase.storage
      .from("collection_data")
      .upload(filePath, decode(base64), {
        contentType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { publicUrl } = supabase.storage
      .from("collection_data")
      .getPublicUrl(data.path).data;

    if (!publicUrl) throw new Error("Unable to get public URL");
    return publicUrl;
  } catch (error) {
    console.log(error);
    return "";
  }
};

export default uploadImage;
