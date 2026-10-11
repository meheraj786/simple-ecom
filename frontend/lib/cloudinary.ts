"use client";

export type CloudinaryUploadOptions = {
  folder?: string;
  signal?: AbortSignal;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

export async function uploadImageOrVideo(
  file: File,
  options: CloudinaryUploadOptions = {},
): Promise<string> {
  if (!file.size) {
    throw new Error("Choose a non-empty image or video file");
  }
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    throw new Error("Only image and video files can be uploaded");
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set the cloud name and unsigned upload preset.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (options.folder?.trim()) {
    formData.append("folder", options.folder.trim());
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`,
    {
      method: "POST",
      body: formData,
      signal: options.signal,
    },
  );
  const result = (await response
    .json()
    .catch(() => null)) as CloudinaryUploadResponse | null;

  if (!response.ok || !result?.secure_url) {
    throw new Error(
      result?.error?.message ?? `Cloudinary upload failed (${response.status})`,
    );
  }

  return result.secure_url;
}
