const { Router } = require("express")
const messageRouter = Router();

const { isAuthenticated, newMessageGet, newMessagePost, deleteMessagePost } = require("../controllers/messageController");

messageRouter.get("/new", isAuthenticated, newMessageGet);
messageRouter.post("/new", isAuthenticated, newMessagePost);

messageRouter.post("/:message_id/delete", isAuthenticated, deleteMessagePost);

module.exports = messageRouter;