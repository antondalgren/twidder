DROP TABLE IF EXISTS users;
CREATE TABLE users (
 id INTEGER PRIMARY KEY,
 first_name TEXT NOT NULL,
 family_name TEXT NOT NULL,
 email text NOT NULL UNIQUE,
 city text NOT NULL,
 country text NOT NULL,
 gender text NOT NULL,
 password text NOT NULL
);

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
 id INTEGER PRIMARY KEY,
 message TEXT NOT NULL,
 to_email TEXT NOT NULL,
 from_email TEXT NOT NULL
);

DROP TABLE IF EXISTS active_users;
CREATE TABLE active_users (
 id INTEGER PRIMARY KEY,
 token TEXT NOT NULL,
 email TEXT NOT NULL
);


