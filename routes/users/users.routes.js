const { Router } = require("express");
//const projectController = require("../../controllers/projects.controller");
//const tokenAuthentifie = require("../../config/jwt.authenticated");
const ownerController = require('../../controllers/users/owner.controller.js');
const globalUserController = require('../../controllers/users/user.global.controller.js');

const { upload } = require('../../utils/multer.js');
const router = Router();


// OWNERS
//Register
router.post('/owner/new', globalUserController.Register('owner') ), 
// router.post('/owner', ownerController.Register);

// Login
router.post('/login', globalUserController.Login);

//Logout
router.post('/logout', globalUserController.Logout);


// update 
router.patch('/user', [upload.fields([{ name: 'image', maxCount: 1 }])], globalUserController.Edit);


module.exports = router;
