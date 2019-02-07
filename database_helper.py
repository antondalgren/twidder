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
  print(args)
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
  c = conn.cursor()
  res = c.execute('''
    SELECT
    email
    FROM users WHERE email=? AND password=?
    ''', (email, password))
  return res.fetchone()

def post_message(from_email, to_email, message):
  c = conn.cursor()
  c.execute('''
    INSERT
    INTO posts (from_email, to_email, message) VALUES (?, ?, ?)
    ''', (from_email, to_email, message))
  conn.commit()

def signin(token, email):
  c = conn.cursor()
  c.execute('''
    INSER INTO active_users (token, email) VALUES (?, ?)
  ''', (token, email))
  conn.commit()

def signout(token):
  c = conn.cursor()
  c.execute('''
    DELETE FROM active_users WHERE token=?
  ''', token)
  conn.commit()

def get_messages(email):
  c = conn.cursor()
  res = c.execute('''
    SELECT * FROM posts WHERE to_email=?
  ''', email)
  return res.fetchall()

def email_from_token(token):
  c = conn.cursor()
  res = c.execute('''
    SELECT email FROM active_users WHERE token=?
  ''', token)
  return res.fetchall()
