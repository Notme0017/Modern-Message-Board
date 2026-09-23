const { validationResult, matchedData } = require("express-validator");
const { messageValidator } = require("./validators");
const { addMessage, deleteMessageById, getAllMessages, getMessageById } = require("../db/queries");

exports.isAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) return next();
  res.redirect("/log-in");
}

exports.newMessageGet = (req, res, next) => {
  res.render("new-message", {
    title: "New Message"
  })
};

exports.newMessagePost = [
  messageValidator,
  async (req, res, next) =>{
    try{
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).render("new-message",
          {
            title: "New Message",
            errors: errors.array(),
            messagetitle: req.body.messagetitle,
            message: req.body.message
          }
        );
      }

      const {messagetitle, message} = matchedData(req);
      await addMessage({title: messagetitle, message, user_id: req.user.id});
      res.redirect("/");
    }catch(err){
      next(err);
    }
  }
];

exports.deleteMessagePost = async(req, res, next) =>{
  try{
    const message_id = req.params.message_id;

    const message = await getMessageById(message_id);
    if(!message){
      return res.status(404).render("error", {title: "Error",
        message: "Message not found"});
    }
    if(message.user_id !== req.user.id){
      return res.status(403).render("error", {title: "Error",
        message: "Not authorized"});
    }

    await deleteMessageById(message_id);
    res.redirect("/");
  }catch(err){
    next(err);
  }
}