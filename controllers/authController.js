const { validationResult, matchedData} = require("express-validator");
const { hashPassword, matchPassword } = require("./encryption");
const { addUser, getAllMessages, getMembershipPassCode, setMembership, getAdminPassCode, setAdmin } = require("../db/queries");
const { signupValidator, loginValidator, membershipValidator} = require("./validators");
const passport = require("passport");

exports.showMessagesGet = async (req, res, next) =>{
  const messages = await getAllMessages();
  res.render("index", {
    title: "Index",
    messages: messages,
  });
};

exports.signUpFormGet = async (req, res, next) =>{
  res.render("sign-up", {title: "Sign Up"});
}

exports.signUpFormPost = [
  signupValidator,
  async (req, res, next) => {
    try{
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        const dbFailed = errors.array().some(e => e.msg === "Database Error!");
        if(dbFailed) return next(new Error("Database Error during signup validation"));
        return res.status(400).render('sign-up',{
          title: "Sign Up",
          errors: errors.array(),
          username: req.body.username,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
        });
      }
      const {firstname, lastname, username, password} = matchedData(req);
      const hashedPassword = await hashPassword(password);
      await addUser({firstname, lastname, username, password: hashedPassword});

      res.redirect("/log-in");
    }catch(err){
      next(err);
    }
  },
];

exports.loginFormGet = async(req, res, next) =>{
  res.render("log-in", {
    title: "Log In"
  });
}

exports.loginFormPost = [
  loginValidator,
  async (req, res, next) => {
    try{
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).render('log-in', {
          title: "Log In",
          errors: errors.array()
        });
      }

      passport.authenticate("local", (err, user, info) =>{
        if(err) return next(err);

        if(!user){
          return res.status(400).render('log-in',{
            title: "Log In",
            errors: [{msg: info?.message || "Invalid username or password"}],
          });
        }

        req.logIn(user, (err) =>{
          if(err) return next(err);
          return res.redirect("/");
        });
      })(req, res, next);

    }catch(err) {
      next(err);
    }
  },
];

exports.logoutPost = async(req, res, next) =>{
  req.logout((err) =>{
    if(err) return next(err);
    res.redirect("/");
  });
};

exports.joinMembershipGet = async(req, res, next) =>{
  res.render("membership", {
    title: "Join Membership"
  });
};

exports.joinMembershipPost = [
  membershipValidator,
  async (req, res, next) => {
    try{
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).render("membership", {
          title: "Join Membership",
          errors: errors.array()
        });
      }

      const passcode = req.body.passcode;
      const requiredPasscode = await getMembershipPassCode();

      const match = matchPassword(passcode, requiredPasscode);
      if(match){
        const messages = await getAllMessages();
        await setMembership(req.user.id);
        req.user.membership = true;

        return res.render("index", {
          title: "Index",
          messages: messages
        })
      }else return res.render("membership", {
        title: "Join Membership",
        errors: errors.array()
      });
    }catch(err){
      next(err);
    }
  }
];

exports.becomeAdminGet = async(req, res, next) =>{
  res.render("admin", {
    title: "Become Admin"
  });
};

exports.becomeAdminPost = [
  membershipValidator,
  async (req, res, next) =>{
    try{
      const errors = validationResult(req);
        if(!errors.isEmpty()){
          return res.status(400).render("admin", {
            title: "Become Admin",
            errors: errors.array()
          });
        }
  
        const passcode = req.body.passcode;
        const requiredPasscode = await getAdminPassCode();
  
        const match = matchPassword(passcode, requiredPasscode);
        if(match){
          const messages = await getAllMessages();
          await setAdmin(req.user.id);
          req.user.membership = true;
          req.user.admin = true;
  
          return res.render("index", {
            title: "Index",
            messages: messages
          })
        }else return res.render("admin", {
          title: "Become Admin",
          errors: errors.array()
        });
      }catch(err){
      next(err);
    }
  }
]
