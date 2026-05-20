const cloudinary = require("../config/Cloudinary");
const { Readable } = require("stream");

const WORD_MIMETYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const isWordMime = (mime) => WORD_MIMETYPES.includes(mime);

const uploadBuffer = (buffer, folder = "medreport", resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "docx", "doc"],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

const deleteFile = async (publicId, resourceType = "image") => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn("Cloudinary delete warning:", err.message);
  }
};

const getThumbnailUrl = (publicId, resourceType = "image") => {
  if (resourceType === "image") {
    // Covers regular images AND PDFs uploaded as image resource type
    return cloudinary.url(publicId, {
      resource_type: "image",
      format: "jpg",
      transformation: [{ width: 200, height: 260, crop: "fill" }],
      page: 1,
    });
  }
  return cloudinary.url(publicId, { resource_type: "raw" });
};

/**
 * Convert a Cloudinary publicId (PDF uploaded as image resource) into
 * per-page JPEG URLs that Groq Vision can fetch directly.
 * page is a top-level param, NOT inside transformation.
 */
const pdfToImageUrls = (publicId, maxPages = 4) => {
  return Array.from({ length: maxPages }, (_, i) =>
    cloudinary.url(publicId, {
      resource_type: "image",
      format: "jpg",
      quality: 80,
      page: i + 1,
    })
  );
};


module.exports = { uploadBuffer, deleteFile, getThumbnailUrl, pdfToImageUrls, isWordMime };