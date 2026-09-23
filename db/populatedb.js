const { Client } = require("pg");

const SQL = `

DROP TABLE IF EXISTS "user_sessions";

CREATE TABLE IF NOT EXISTS "user_sessions" (
  "sid" VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
)
WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  membership BOOLEAN DEFAULT FALSE NOT NULL,
  admin BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR(255),
  message TEXT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  time TIMESTAMPTZ DEFAULT NOW()
);
`;

async function main() {
  const connectionString = process.argv[2];

  if(!connectionString){
    console.error("Use: node db/populatedb.js <connection-string>");
    process.exit(1);
  }

  console.log("seeding...");
  const isLocal = connectionString.includes("localhost");
  const client = new Client({
    connectionString,
    ssl: isLocal? false: {rejectUnauthorized: false},
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("Done");
}

main().catch((err) =>{
  console.error(err);
  process.exit(1);
});