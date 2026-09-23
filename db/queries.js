const { hashPassword } = require("../controllers/encryption");
const pool = require("./pool");

const membershipPasscode = "fuel";
const adminPasscode = "Fuel";

exports.addUser = async ({firstname, lastname, username, password}) => {
  const id = await pool.query(`
    INSERT INTO users (firstname, lastname, username, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id`, [firstname, lastname, username, password]);
};

exports.getUserByUsername = async(username) =>{
  const {rows} = await pool.query(`
    SELECT id, username, password FROM users
    WHERE username = $1`, [username]);
  
  return rows[0];
};

exports.getUserById = async (id) => {
  const {rows} = await pool.query(`
    SELECT id, username, membership, admin FROM users
    WHERE id = $1`, [id]);
  
  return rows[0];
};

exports.getMessageById = async(id) =>{
  const {rows} = await pool.query(
    `SELECT id, title, message, user_id FROM messages
    WHERE id = $1`, [id]
  );
  return rows[0];
}

exports.getAllMessages = async () =>{
  const {rows} = await pool.query(
    `SELECT u.id AS user_id, u.username, m.id AS message_id, m.title, m.message, m.time
    FROM messages m
    JOIN users u ON m.user_id = u.id
    ORDER BY m.time DESC
    `);
  return rows;
};

exports.addMessage = async({title, message, user_id}) =>{
  await pool.query(`
    INSERT INTO messages (title, message, user_id)
    VALUES ($1, $2, $3)`, [title, message, user_id]);
};

exports.deleteMessageById = async (id) => {
  await pool.query(
    `DELETE FROM messages
    WHERE id = $1`, [id]
  );
};

exports.setMembership = async(userId) =>{
  await pool.query(
    `UPDATE users SET membership = true WHERE id = $1`, [userId]
  );
};

exports.setAdmin = async (userId) => {
  await pool.query(
    `UPDATE users SET admin = true WHERE id = $1`, [userId]
  );
};

/*-------Validation Queries--------- */

exports.usernameExists = async(username) =>{
  const result = await pool.query(`
    SELECT id FROM USERS WHERE username = $1`, 
  [username]
);
  return result.rowCount > 0;
}

exports.getMembershipPassCode = () =>{
  return hashPassword(membershipPasscode);
}

exports.getAdminPassCode = () =>{
  return hashPassword(adminPasscode);
}

