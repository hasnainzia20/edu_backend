import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (_, file, cb) => {
  if (
    ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
      file.mimetype
    )
  )
    cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
