const { ref, getDownloadURL, uploadBytesResumable } = require('firebase/storage');
const { storage } = require('../config/firebase');
const sharp = require('sharp');

async function uploadFile(file) {
    try {
        // Procesar la imagen con sharp
        let fileBuffer = await sharp(file.buffer)
            .resize({ width: 200, height: 200, fit: 'cover' })
            .toBuffer();

        // Crear referencia en Firebase Storage con un nombre de archivo único
        const fileRef = ref(storage, `files/${file.originalname}_${Date.now()}`);

        // Metadatos del archivo
        const fileMetadata = {
            contentType: file.mimetype,
        };

        // Subir el archivo con datos resumidos
        const fileUploadPromise = uploadBytesResumable(fileRef, fileBuffer, fileMetadata);

        // Esperar a que la subida termine
        await fileUploadPromise;

        // Obtener URL de descarga del archivo subido
        const fileDownloadURL = await getDownloadURL(fileRef);

        // Retornar referencia y URL de descarga
        return { ref: fileRef, downloadURL: fileDownloadURL };
    } catch (error) {
        console.error("Error while uploading file:", error);
        throw new Error("Error while uploading file. Please try Again.");
    }
}

module.exports = {
    uploadFile
};