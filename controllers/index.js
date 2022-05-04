import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
// import mongoose from "mongoose";

import sendMailMethod from "../middleware/sendMail.js";
import User from "../models/userModel.js";

const router = express.Router();

export const getHome = (req, res) => {
  res.render("pages/main/index", {
    logged: req.isAuthenticated(),
  });
};

export const getAbout = (req, res) => {
  res.render("pages/main/aboutus");
};

export const getLogin = (req, res) => {
  res.render("pages/authentication/login");
};

export const postLogin = passport.authenticate("local", {
  successRedirect: "/hub",
  failureRedirect: "/login",
  failureFlash: true,
});

export const getContact = (req, res) => {
  res.render("pages/main/contact");
};

export const postContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      throw new Error("Please fill all the fields", { cause: 400 });
    }
    await sendMailMethod({
      from: email,
      to: "tatanlorca13@gmail.com",
      subject: "Contact Form",
      text: `Message's author: ${name}.\n\n${message}`,
    });
    req.flash("success", "Message sent");
    res.redirect("/");
  } catch (error) {
    switch (error.cause) {
      case 400:
        res.status(400);
        break;
      default:
        res.status(500);
        break;
    }
    req.flash("error", `${error.name}: ${error.message}`);
    res.status(502).render("pages/main/contact");
  }
};

export const getRegister = (req, res) => {
  res.render("pages/authentication/register");
};

export const postRegister = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = new User();
    user.email = req.body.email;
    user.password = hashedPassword;
    user.username = req.body.username;
    await user.save();
    res.redirect("/login");
  } catch (err) {
    req.flash("error", `${err.name}: ${err.message}`);
    res.redirect("/register");
  }
};

export const deleteLogin = (req, res) => {
  req.logOut();
  res.redirect("/login");
};
export default router;
