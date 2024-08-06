const mongoose = require("mongoose");

const MenuSchema = mongoose.Schema({

    title: String, // text on page
    path: String, // URL where user goes when click or tap
    order: Number, // position 
    isActive: boolean, // visualize menu on web

});


module.exports = mongoose.model("Menu", MenuSchema);