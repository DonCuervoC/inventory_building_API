// const User = require("../models/user");
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const { getDb } = require('../../mongoConnection');
const { validateRegisterOwnerFields, validateUpdateOwnerFields } = require('../../utils/validatorFields');
const logger = require('../../utils/logger');
// const image = require("../utils/image");

const Owner = require('../../modeles/users/user.owner.model');
const userOwner = require('../../modeles/users/user.global')


const AES_KEY = process.env.AES_KEY;
const TENNANTS_COLLECTION = process.env.TENNANTS_COLLECTION;
const PROPERTIES_COLLECTION = process.env.PROPERTIES_COLLECTION;
const OWNERS_COLLECTION = process.env.OWNERS_COLLECTION;
const G_USER_COLLECTION = process.env.G_USER_COLLECTION;
const MYDATABASE = process.env.MYDATABASE;


const CREATED_STATUS = process.env.CREATED_STATUS;
const DELETED_STATUS = process.env.DELETED_STATUS;
const WATCHED_STATUS = process.env.WATCHED_STATUS;
const UPDATED_STATUS = process.env.UPDATED_STATUS;
const ERROR_STATUS = process.env.ERROR_STATUS;


const mainDb = getDb(`${MYDATABASE}`);
const userCollection = mainDb.collection(G_USER_COLLECTION);
const ownerCollection = mainDb.collection(OWNERS_COLLECTION);


async function AreOwnersCoOwners(ownerId1, ownerId2) {
    try {
        const propertiesCollection = mainDb.collection(PROPERTIES_COLLECTION);

        // Recherche d'une propriété qui contient à la fois ownerId1 et ownerId2 dans son tableau 'owners'
        const coOwnedProperty = await propertiesCollection.findOne({
            owners: { $all: [ownerId1, ownerId2] }
        });

        // Si une propriété est trouvée, cela signifie que les deux propriétaires sont co-propriétaires
        return !!coOwnedProperty;
    } catch (error) {
        console.error("Erreur durant la recherche CoOwners", error);
        throw error; // Renvoie l'erreur pour être gérée par le caller
    }
}

async function Register(req, res) {
    try {
        const { email, name, password, phone, address, companyName } = req.body;
        const emailLowerCase = email.toLowerCase();

        await validateRegisterOwnerFields(req);


        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }


        // let userExisting = await ownerCollection.findOne({ email: emailLowerCase });
        let userExisting = await userCollection.findOne({ email: emailLowerCase });

        if (userExisting) {
            return res.status(400).json({ msg: "Error new user: email already exist" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userOwner({
            email: emailLowerCase,
            name: name,
            password: hashedPassword,
            phone: phone,
            address: address,
            companyName: companyName,
            roles: ["owner"],
            isActive: true
        });

        newUser.set('properties', undefined);
        newUser.set('appointments', undefined);
        newUser.set('customerData', undefined);
        newUser.set('units', undefined);
        newUser.set('contracts', undefined);
        newUser.set('moveInDate', undefined);


        // const insertResult = await ownerCollection.insertOne(newUser);
        const insertResult = await userCollection.insertOne(newUser);

        if (!insertResult.acknowledged) {
            return res.status(500).json({ msg: "New Owner : error while inserting new data" });
        }


        const newOwnerId = insertResult.insertedId.toString();


        // // Chiffrer les données brutes sans les convertir en JSON
        // const encryptedData = encryptData(newUser, AES_KEY);

        // // Utilisation de l'ID du propriétaire comme clé de cache
        // const cacheKey = `${newOwnerId}`;
        // myCache.set(cacheKey, encryptedData, 600); // Mettre à jour le cache en conséquence

        // Envoi d'un email de confirmation
        //      await sendConfirmationEmail(emailLowerCase, name);

        logger.info(`{action: new-owner, status: ${CREATED_STATUS}, ownerId: ${newOwnerId}}`);
        return res.status(201).json({ msg: "new-owner-ok", ownerId: newOwnerId });
    } catch (error) {

        logger.info(`{action: new-owner, status: ${CREATED_STATUS}, statusCode: ${error.statusCode || 500}message: ${error.message}`);
        return res.status(error.statusCode || 500).json({ error: error.message || error });
    }
}

async function userLogin(req, res) {

    try {
        const { email, password} = req.body;
       
      // Validation des champs de la requête
      await body('email').isEmail().withMessage("L'adresse e-mail est invalide").notEmpty().withMessage("L'adresse e-mail est requise").run(req);
      await body('password').notEmpty().withMessage('Le mot de passe est requis').run(req);

      // Vérification des erreurs de validation
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
          return res.status(400).json({ errors: validationErrors.array() });
      }
       // On convertit l'adresse e-mail en minuscules pour assurer une recherche insensible à la casse
        const emailLowerCase = email.toLowerCase();
      
        // Si le jeton d'accès n'est pas trouvé dans la cache, continuer avec la vérification habituelle dans la base de données
        console.log('Interrogation de la base de données...');

        // On se connecte à la base de données principale "test"
        const userCollection = mainDb.collection(OWNERS_COLLECTION);

        // // On cherche l'utilisateur dans la collection mainUsers par email
        const loggedInUser = await userCollection.findOne({ "email": emailLowerCase });

        //if(loggedInUser && loggedInUser.status){
        if(loggedInUser){
            const passwordMatch = await bcrypt.compare(password, loggedInUser.password);
            // console.log(passwordMatch,'el pas');

            if (passwordMatch) {
                // Vérifier si le compte est actif, sinon l'activer
                if (!loggedInUser.isActive) {
                    await userCollection.updateOne({ "email": emailLowerCase }, { $set: { isActive: true } });
                    logger.info(`Compte utilisateur activé : ${loggedInUser._id}`);
                }
                // Générer un token JWT pour l'utilisateur
                A7 = jwt.createAccessToken(loggedInUser);
                logger.info(`Utilisateur authentifié avec succès : ${loggedInUser._id}`);
                res.status(200).json({ msg: "Utilisateur authentifié avec succès", token: A7, user: loggedInUser._id });
            } else {
                // ajout pour valider mot pass (rosemberg) verifie si c'est correct 
                logger.error(getLoginOwnerErrorMessages("msgPassNotCorrect"));
                res.status(401).json({msg:getLoginOwnerErrorMessages("msgPassNotCorrect")})
            }

        } else {
            // ajout pour valider user (rosemberg) verifie si c'est correct 
            res.status(401).json({msg:getLoginOwnerErrorMessages("msgUserNotFound")})
        }   
       
    } catch (error) {
        console.error(getLoginOwnerErrorMessages("msgErrorTryAgain"), error);
        return res.status(500).json({ error: getLoginOwnerErrorMessages("msgErrorTryAgain") });
    }

}

module.exports = {
    Register
};