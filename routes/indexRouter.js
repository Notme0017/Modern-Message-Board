const {Router} = require("express");
const indexRouter = Router();

const {showMessagesGet, signUpFormGet, signUpFormPost, loginFormGet, loginFormPost, logoutPost, joinMembershipGet, joinMembershipPost, becomeAdminGet, becomeAdminPost} = require("../controllers/authController");
const { isAuthenticated } = require("../controllers/messageController");

indexRouter.get("/", showMessagesGet);
indexRouter.get("/sign-up", signUpFormGet);
indexRouter.post("/sign-up", signUpFormPost);
indexRouter.get("/log-in", loginFormGet);
indexRouter.post("/log-in", loginFormPost);
indexRouter.post("/log-out", logoutPost);

indexRouter.get("/join-membership", isAuthenticated, joinMembershipGet);
indexRouter.post("/join-membership", isAuthenticated, joinMembershipPost);

indexRouter.get("/admin", isAuthenticated, becomeAdminGet);
indexRouter.post("/admin", isAuthenticated, becomeAdminPost);

module.exports = indexRouter;