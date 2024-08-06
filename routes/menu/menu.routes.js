const { Router } = require("express");
const MenuController = require("../../controllers/menu/menu.controller");
// const md_auth = require("../middlewares/authenticated");
const md_auth = require("../../auth/middlewares/jwt.authenticated");

const api = Router();

//Endpoint
api.post("/menu", [md_auth.ensureAuthOwnerAdminMaster], MenuController.createMenu);
api.get("/menu", MenuController.getMenus);
//api.patch("/menu/:id", [md_auth.asureAuth], MenuController.updateMenu);
api.patch("/menu/:id", [md_auth.ensureAuthOwnerAdminMaster], MenuController.updateMenu);
api.delete("/menu/:id", [md_auth.ensureAuthOwnerAdminMaster], MenuController.deleteMenu);


module.exports = api;
