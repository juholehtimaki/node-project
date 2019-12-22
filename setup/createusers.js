"use strict";

module.exports = async userConfig => {
    const User = require("../models/user");
    const admin = await User.findOne({ role: "admin" }).exec();

    if (admin) {
        return "Admin not created: at least one admin user already found in database.";
    }

    const adminEmail = await User.findOne({ email: "admin@email.fi" }).exec();

    if(adminEmail) {
      return "Admin not created: admin email already in use.";
    }
    
    const user = new User(userConfig);
    user.role = "admin";
    await user.save();
    return "Admin user successfully created";
};
