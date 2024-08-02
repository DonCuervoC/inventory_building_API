const { ref, getDownloadURL, uploadBytesResumable, deleteObject  } = require('firebase/storage');
const { storage } = require('../config/firebase');
const sharp = require('sharp');

const FBFN_FILES = process.env.FBFN_FILES;
const FBFN_AVATAR = process.env.FBFN_AVATAR;
const FBFN_PROPERTIES = process.env.FBFN_PROPERTIES;


async function uploadFile(file) {
    try {
        // console.log("uploadFile");

        // Procesar la imagen con sharp
        let fileBuffer = await sharp(file.buffer)
            .resize({ width: 200, height: 200, fit: 'cover' })
            .toBuffer();

        // Crear referencia en Firebase Storage con un nombre de archivo único
        // const fileRef = ref(storage, `files/${file.originalname}_${Date.now()}`);
        const fileRef = ref(storage, `${FBFN_FILES}/${file.originalname}_${Date.now()}`);

        // console.log("FBFN_FILES: ", FBFN_FILES);

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

async function uploadImageAvatar(file) {
    try {

        // console.log("uploadImage");
        // Procesar la imagen con sharp
        let fileBuffer = await sharp(file.buffer)
            .resize({ width: 200, height: 200, fit: 'cover' })
            .toBuffer();

        // Crear referencia en Firebase Storage con un nombre de archivo único
        // const fileRef = ref(storage, `avatars/${file.originalname}_${Date.now()}`);
        const fileRef = ref(storage, `${FBFN_AVATAR}/${file.originalname}_${Date.now()}`);

        // console.log("FBFN_AVATAR: ", FBFN_AVATAR);

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

async function uploadImageProperty(file) {
    try {

        // console.log("uploadImageProperty: ");
        // Procesar la imagen con sharp
        let fileBuffer = await sharp(file.buffer)
            .resize({ width: 200, height: 200, fit: 'cover' })
            .toBuffer();

        // Crear referencia en Firebase Storage con un nombre de archivo único
        // const fileRef = ref(storage, `properties/${file.originalname}_${Date.now()}`);
        const fileRef = ref(storage, `${FBFN_PROPERTIES}/${file.originalname}_${Date.now()}`);

        // console.log("FBFN_PROPERTIES: ", FBFN_PROPERTIES);
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

async function deleteFile(fileURL) {
    try {
        // Extraer el nombre del archivo de la URL
        const filePath = decodeURIComponent(fileURL.split('/o/')[1].split('?')[0].replace(/%2F/g, '/'));

        // Crear referencia del archivo en Firebase Storage
        const fileRef = ref(storage, filePath);

        // Eliminar el archivo
        await deleteObject(fileRef);

        console.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
        console.error("Error while deleting file:", error);
        throw new Error("Error while deleting file. Please try again.");
    }
}


module.exports = {
    uploadFile,
    uploadImageAvatar,
    deleteFile,
    uploadImageProperty
};