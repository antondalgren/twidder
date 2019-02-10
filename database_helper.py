import sqlite3
from flask import g

DATABASE = 'database.db'

def get_db():
  db = getattr(g, '_database', None)
  if db is None:
      db = g._database = sqlite3.connect(DATABASE)
  db.row_factory = make_dicts
  return db

def make_dicts(cursor, row):
  return dict((cursor.description[idx][0], value)
          for idx, value in enumerate(row))


def query_db(query, args=(), one=False):
  cur = get_db().execute(query, args)
  rv = cur.fetchall()
  cur.close()
  return (rv[0] if rv else None) if one else rv

def signup(email, firstname, familyname, city, gender, password, country):
  query_db('''
    INSERT
    INTO users (email, firstname, familyname, city, gender, password, country) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', [email, firstname, familyname, city, gender, password, country])
  g._database.commit()


def find_user(email):
  res = query_db('''
    SELECT
    email, firstname, familyname, city, gender, country
    FROM users WHERE email=?
    ''', [email], True)
  return res

def find_user_with_password(email, password):
  res = query_db('''
    SELECT
    email
    FROM users WHERE email=? AND password=?
    ''', [email, password], True)
  return res

def post_message(from_email, to_email, message):
  query_db('''
    INSERT
    INTO posts (from_email, to_email, message) VALUES (?, ?, ?)
    ''', [from_email, to_email, message])
  g._database.commit()

def signin(token, email):
  query_db('''
    INSERT INTO active_users (token, email) VALUES (?, ?)
  ''', [token, email])
  g._database.commit()

def signout(token):
  query_db('''
    DELETE FROM active_users WHERE token=?
  ''', token)

def get_messages(email):
  res = query_db('''
    SELECT * FROM posts WHERE to_email=?
  ''', email)
  return res

def email_from_token(token):
  res = query_db('''
    SELECT email FROM active_users WHERE token=?
  ''', token, True)
  return res
