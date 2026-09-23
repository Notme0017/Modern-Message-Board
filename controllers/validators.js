const { body } = require("express-validator");
const { usernameExists } = require("../db/queries");

const signupValidator = [
  body("firstname")
    .trim()
    .notEmpty().withMessage("First name is mandatory")
    .isLength({max: 255}).withMessage("First name is too long"),

  body("lastname")
    .trim()
    .isLength({max: 255}).withMessage("Last Name is too long"),

  body("username")
    .trim()
    .notEmpty().withMessage("Please select a username")
    .isLength({max: 255}).withMessage("Username is too long")
    .custom(async (value) =>{
      let exits;
      try{
        exits = await usernameExists(value);
      }catch(err) {throw new Error("Database Error!")};
      if(exits) throw new Error("Username is already taken");
      return true;
    }),

  body("password")
    .notEmpty().withMessage("Please enter a password")
    .isLength({max: 100}).withMessage("Password is too long"),
  
  body("confirmpassword")
    .custom((value, {req}) => value === req.body.password).withMessage("Passwords do not match"),
];

const loginValidator = [
  body("username")
  .trim()
  .notEmpty().withMessage("Please select a username")
  .isLength({max: 255}).withMessage("Username is too long"),

  body("password")
  .notEmpty().withMessage("Please enter a password")
  .isLength({max: 100}).withMessage("Password is too long"),
];

const messageValidator = [
  body("messagetitle")
    .trim()
    .notEmpty().withMessage("Add a title")
    .isLength({max: 255}).withMessage("Title is too long"),

  body("message")
    .trim()
    .notEmpty().withMessage("No message to post!"),
];

const membershipValidator = [
  body("passcode")
    .trim()
    .notEmpty().withMessage("Enter the passcode")
];


module.exports = {signupValidator, 
                  loginValidator,
                  messageValidator,
                  membershipValidator};