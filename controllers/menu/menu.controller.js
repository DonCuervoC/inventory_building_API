
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const { getDb } = require('../../mongoConnection.js');
const { validateMenuFields } = require('../../utils/validatorFields.js');
const { uploadFile, uploadImageProperty, deleteFile } = require('../../utils/uploadFile.js');
const { setCache, getCache, deleteCache } = require('../../utils/cache.js');
const { OwnerHasProperty, RoleAuthEditProperty } = require('../../auth/userAccess/access.users.js');


const Menu = require("../../modeles/menu/menu.js");

const AES_KEY = process.env.AES_KEY;
const TENNANTS_COLLECTION = process.env.TENNANTS_COLLECTION;
const PROPERTIES_COLLECTION = process.env.PROPERTIES_COLLECTION;
const OWNERS_COLLECTION = process.env.OWNERS_COLLECTION;
const G_USER_COLLECTION = process.env.G_USER_COLLECTION;
const MYDATABASE = process.env.MYDATABASE;
const FBFN_PROPERTIES = process.env.FBFN_PROPERTIES;
const MENU_COLLECTION = process.env.MENU_COLLECTION;


const mainDb = getDb(`${MYDATABASE}`);
const userCollection = mainDb.collection(G_USER_COLLECTION);
const propertyCollection = mainDb.collection(PROPERTIES_COLLECTION);
const menuCollection = mainDb.collection(MENU_COLLECTION);


async function createMenu(req, res) {
    try {

        const menuData = req.body;

        await validateMenuFields(req);

        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }

        const newMenu = new Menu({
            title: menuData.title,
            path: menuData.path,
            order: menuData.order,
            isActive: menuData.isActive,
        });

        const insertMenu = await menuCollection.insertOne(newUser);

        res.status(200).send(insertMenu);

    } catch (error) {
        res.status(400).send({ msg: "Error while creating menu" });
    }
}

async function getMenus(req, res) {
    const { active } = req.query;

    let response = null;

    if (active === undefined) {
        response = await Menu.find().sort({ order: "asc" });
    } else {
        response = await Menu.find({ active }).sort({ order: "asc" });
    }
    if (!response.length) {
        res.status(400).send({ msg: "No menus were found" });
    } else {
        res.status(200).send(response);
    }
}

async function updateMenu(req, res) {
    const { id } = req.params;
    const menuData = req.body;

    try {
        const updatedMenu = await Menu.findByIdAndUpdate({ _id: id }, menuData, { new: true }).exec();
        res.status(200).send({ msg: "Update OK", menu: updatedMenu });
    } catch (error) {
        res.status(400).send({ msg: "Error while updating menu" });
    }
}


async function deleteMenu(req, res) {
    const { id } = req.params;
  
    try {
      const deletedMenu = await Menu.findByIdAndDelete(id).exec();
      if (!deletedMenu) {
        res.status(404).send({ msg: "Menu not found" });
        return;
      }
      res.status(200).send({ msg: "Deleted OK", menu: deletedMenu });
    } catch (error) {
      console.error(error);
      res.status(500).send({ msg: "Error while deleting menu" });
    }
  }


module.exports = {

    createMenu,
    getMenus,
    updateMenu,
    deleteMenu

};



