import * as ImagePicker from "expo-image-picker";

const BASE_URL = "http://YOUR_IP:5000";  // replace with your machine's IP

export async function pickAndUploadPrescription(
  email: string,
  token: string
): Promise<{ Medicine: string[]; Dosage: string[] } | null> {
  // 1. Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const filename = asset.uri.split("/").pop() ?? "prescription.jpg";
  const fileType = "image/jpeg";

  // 2. Build form data
  const formData = new FormData();
  formData.append("email", email);
  formData.append("pic_name", filename);
  formData.append("file", {
    uri: asset.uri,
    name: filename,
    type: fileType,
  } as any);

  // 3. POST to backend
  const response = await fetch(`${BASE_URL}/dashboard/upload_prescription`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) return null;

  const data = await response.json();
  return typeof data === "string" ? JSON.parse(data) : data;
}