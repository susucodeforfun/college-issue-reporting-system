const express = require("express");
const router = express.Router();
const data = require("../data");
const userFunctions = data.users;

// 1. Getting the signup page
router.get("/signup", async (req, res) => {
  if (!req.session.user) {
    res.render("createAccount");
  } else {
    res.redirect("/dashboard");
  }
});

// 2. Getting the login page
router.get("/", async (req, res) => {
  if (!req.session.user) {
    res.render("login");
  } else {
    res.redirect("/dashboard");
  }
});

router.get("/login", async (req, res) => {
  if (!req.session.user) {
    res.redirect("/");
  } else {
    res.redirect("/private");
  }
});

// 3.Getting the dashboard after login
router.get("/dashboard", async (req, res) => {
  res.render("dashBoard");
});

// 4. POST for SignUp
router.post("/signup", async (req, res) => {
  try {
    let username = req.body["username"].trim().toLowerCase();
    let password = req.body["password"].trim();
    let firstName = req.body["firstname"].trim();
    let lastName = req.body["lastname"].trim();
    let email = req.body["email"].trim();
    let major = req.body["major"].trim();
    let year = req.body["year"].trim();
    let bio = req.body["bio"];
    year = parseInt(year);
    if (!username) {
      res
        .status(404)
        .render("createAccount", { error: "Must supply username!." });
      return;
    }
    if (/\s/.test(username)) {
      res.status(400).render("createAccount", { error: `Username has spaces` });
      return;
    }
    if (!username.match(/^[a-z0-9]+$/i)) {
      res.status(400).render("createAccount", {
        error: `Only alphanumeric characters allowed!`,
      });
      return;
    }
    if (username.length < 4) {
      res.status(400).render("createAccount", {
        error: `Length of username must be atleast 4 characters long!`,
      });
      return;
    }
    if (!password) {
      res
        .status(404)
        .render("createAccount", { error: "Must supply password!" });
      return;
    }
    if (/\s/.test(password)) {
      res.status(400).render("createAccount", { error: `Username has spaces` });
      return;
    }
    if (password.length < 6) {
      res.status(400).render("createAccount", {
        error: `Password must be atleast 6 characters long!`,
      });
      return;
    }
    if (!firstName) {
      res
        .status(404)
        .render("createAccount", { error: "Must supply firstname!." });
      return;
    }
    if (/\s/.test(firstName)) {
      res.status(400).render("createAccount", { error: `Username has spaces` });
      return;
    }
    if (!lastName) {
      res
        .status(404)
        .render("createAccount", { error: "Must supply lastname!" });
      return;
    }
    if (/\s/.test(lastName)) {
      res.status(400).render("createAccount", { error: `Username has spaces` });
      return;
    }
    if (!email) {
      res.status(404).render("createAccount", { error: "Must supply email!" });
      return;
    }
    if (/\s/.test(email)) {
      res.status(400).render("createAccount", { error: `Username has spaces` });
      return;
    }
    if (!major) {
      res.status(404).render("createAccount", { error: "Must supply major!" });
      return;
    }
    if (/\s/.test(major)) {
      res.status(400).render("createAccount", { error: `Username has spaces` });
      return;
    }
    if (!year) {
      res.status(404).render("createAccount", { error: "Must supply year!" });
      return;
    }
    if (/\s/.test(year)) {
      res.status(400).render("createAccount", { error: `Username has spaces` });
      return;
    }
    if (typeof year != "number") {
      res
        .status(400)
        .render("createAccount", { error: "Year must be of type number" });
      return;
    }

    const isCredentialsValid = await userFunctions.createUser(
      username,
      firstName,
      lastName,
      email,
      password,
      major,
      year
    );

    if (isCredentialsValid) {
      res.redirect("/");
    } else {
      res
        .status(400)
        .render("createAccount", { error: "Username or password is invalid" });
      return;
    }
  } catch (e) {
    res.render("createAccount", { error: e });
  }
});

// 5. POST for Login
router.post("/login", async (req, res) => {
  try {
    let username = req.body["username"];
    let password = req.body["password"];

    username = username.trim();
    username = username.toLowerCase();
    password = password.trim();

    if (!username) {
      res.status(400).render("login", { error: "You must enter a username!" });
      return;
    }
    if (/\s/.test(username)) {
      res.status(400).render("login", { error: `Username has spaces` });
      return;
    }
    if (!username.match(/^[a-z0-9]+$/i)) {
      res
        .status(400)
        .render("login", { error: `Only alphanumeric characters allowed!` });
      return;
    }
    if (username.length < 4) {
      res.status(400).render("login", {
        error: `Length of username must be atleast 4 characters long!`,
      });
      return;
    }
    if (!password) {
      res.status(400).render("login", { error: `You must enter a password!` });
      return;
    }
    if (/\s/.test(password)) {
      res.status(400).render("login", { error: `Password has spaces` });
      return;
    }
    if (password.length < 6) {
      res.status(400).render("login", {
        error: `Password must be atleast 6 characters long!`,
      });
      return;
    }
    const isCredentialsValid = await userFunctions.checkUser(
      username,
      password
    );

    if (isCredentialsValid) {
      res.redirect("/dashboard");
    } else {
      res
        .status(400)
        .render("login", { error: "Username or password is invalid" });
      return;
    }
  } catch (e) {
    res.render("login", { error: e });
  }
});

module.exports = router;