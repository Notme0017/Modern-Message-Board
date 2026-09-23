const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../db/queries");
const {matchPassword} = require("./encryption");

passport.use(
  new LocalStrategy( async (username, password, done) =>{
    try{
      const user = await db.getUserByUsername(username);
      console.log(user);
      if(!user)
        return done(null, false, {message: "Incorrect Username"});

      const match = await matchPassword(password, user.password)// change the file
      if(!match) return done(null, false, {message: "Incorrect Password"});

      return done(null, user);
    }catch(err){
      return done(err);
    }
}));


passport.serializeUser((user, done) =>{
  done(null, user.id);
});

passport.deserializeUser(async(id, done) =>{
  try{
    const user = await db.getUserById(id);
    done(null, user);
  }catch(err){
    done(err);
  }
});

module.exports = passport;