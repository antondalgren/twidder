import sqlite3

conn = sqlite3.connect('database.db')


def signup(email, firstname, familyname, city, gender, password, country):
  c = conn.cursor()
  c.execute('''
    INSERT
    INTO users (email, firstname, familyname, city, gender, password, country) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (email, firstname, familyname, city, gender, password, country))
  conn.commit()

def find_user(email):
  c = conn.cursor()
  res = c.execute('''
    SELECT
    email, firstname, familyname, city, gender, country
    FROM users WHERE email=?
    ''', email)
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
