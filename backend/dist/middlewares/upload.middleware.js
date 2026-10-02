import multer from "multer";
import path from "path";
import fs from "fs";
const uploadDirectory = path.resolve(process.cwd(), "uploads", "ressources");
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname);
        const nomUnique = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}${extension}`;
        cb(null, nomUnique);
    },
});
const fileFilter = (_req, file, cb) => {
    const typesAutorises = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (!typesAutorises.includes(file.mimetype)) {
        return cb(new Error("Seuls les fichiers PDF, Word et PowerPoint sont autorisés"));
    }
    cb(null, true);
};
export const uploadRessource = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
});
const uploadExerciceDirectory = path.resolve(process.cwd(), "uploads", "exercices");
if (!fs.existsSync(uploadExerciceDirectory)) {
    fs.mkdirSync(uploadExerciceDirectory, { recursive: true });
}
const exerciceStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadExerciceDirectory);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname);
        const nomUnique = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}${extension}`;
        cb(null, nomUnique);
    },
});
const pdfFileFilter = (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
        return cb(new Error("Seuls les fichiers PDF sont autorisés pour les exercices"));
    }
    cb(null, true);
};
export const uploadExercice = multer({
    storage: exerciceStorage,
    fileFilter: pdfFileFilter,
    limits: { fileSize: 20 * 1024 * 1024 },
});
//# sourceMappingURL=upload.middleware.js.map