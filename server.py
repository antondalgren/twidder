from flask import Flask, request, jsonify, make_response
import random
import string
import database_helper
import secrets
import hashlib
import json
app = Flask(__name__)

active_users = {}
@app.route("/")
def hello():
  return app.send_static_file('client.html')

@app.route("/static/<filename>")
def static_files(filename):
  return app.send_static_file(filename)

@app.route('/sign_in', methods=['POST'])
def sign_in():
  body = json.loads(request.data.decode("utf-8"))
  password = _password_hasher(body['password'])
  result = database_helper.find_user_with_password(body['email'], password)
  if result != None:
    token = _signin_user(body['email'])
    return _return_json_message(True, "Successfully logged in", token)
  else:
    return _return_json_message(False, "No such user")

@app.route('/websocket/connect')
def websocket():
  if request.environ.get('wsgi.websocket'):
    socket = request.environ['wsgi.websocket']
    token = socket.receive()
    user = database_helper.email_from_token(token)
    if active_users.get(user['email']) != None:
      if active_users[user['email']]['token'] != token:
        active_users[user['email']]['socket'].send('sign_out')
    active_users[user['email']] = {}
    active_users[user['email']]['token'] = token
    active_users[user['email']]['socket'] = socket
    while True:
      socket.receive()


@app.route('/sign_up', methods=['POST'])
def sign_up():
  body = json.loads(request.data.decode("utf-8"))
  data = body['data']
  password = _password_hasher(data['password'])
  result = database_helper.find_user(data['email'])
  if result != None:
    return _return_json_message(False, "User already exists")
  if (len(data["email"]) == 0 or len(data["password"]) < 4 or len(data['firstname']) == 0 or
      len(data['familyname']) == 0 or len(data['gender']) == 0 or len(data['city']) == 0 or
      len(data['country']) == 0):
      return _return_json_message(False, "Error in provided data")
  else:
    database_helper.signup(data['email'], data['firstname'], data['familyname'], data['city'], data['gender'], password, data['country'])
    return _return_json_message(True, "Successfully created user")

@app.route('/sign_out', methods=['POST'])
def sign_out():
  body = json.loads(request.data.decode("utf-8"))
  token = body['token']
  print(token)
  database_helper.signout(token)
  return _return_json_message(True, "Successfully signed out")

@app.route('/change_password', methods=['POST'])
def change_password():
  body = json.loads(request.data.decode("utf-8"))
  token = body['token']
  old_password = _password_hasher(body['oldPassword'])
  new_password = _password_hasher(body['newPassword'])
  user = database_helper.email_from_token(token)
  result = database_helper.find_user_with_password(user['email'], old_password)
  if result != None:
    database_helper.update_password(user['email'], new_password)
    return _return_json_message(True, "Successfully changed password")
  else:
    return _return_json_message(False, "No such user")

@app.route('/get_user_data_by_token', methods=['POST'])
def get_user_data_by_token():
  body = json.loads(request.data.decode("utf-8"))
  token = body['token']
  user = database_helper.email_from_token(token)
  result = database_helper.find_user(user['email'])
  if result != None:
    return _return_json_message(True, "Successfully found user", result)
  else:
    return _return_json_message(False, "No such user")

@app.route('/get_user_data_by_email', methods=['POST'])
def get_user_data_by_email():
  body = json.loads(request.data.decode("utf-8"))
  token = body['token']
  if database_helper.email_from_token(token) == None:
    return _return_json_message(False, "User not signed in")
  email = body['email']
  result = database_helper.find_user(email)
  if result != None:
    return _return_json_message(True, "Successfully found user", result)
  else:
    return _return_json_message(False, "No such user")

@app.route('/get_messages_by_token', methods=['POST'])
def get_messages_by_token():
  body = json.loads(request.data.decode("utf-8"))
  token = body['token']
  user = database_helper.email_from_token(token)
  if user == None:
    return _return_json_message(False, "User not signed in")
  result = database_helper.get_messages(user['email'])
  return _return_json_message(True, "Successfully found messages", result)

@app.route('/get_messages_by_email', methods=['POST'])
def get_messages_by_email():
  body = json.loads(request.data.decode("utf-8"))
  token = body['token']
  user = database_helper.email_from_token(token)
  if user == None:
    return _return_json_message(False, "User not signed in")
  result = database_helper.get_messages(body['email'])
  return _return_json_message(True, "Successfully found messages", result)

@app.route('/post_message', methods=['POST'])
def post_message():
  body = json.loads(request.data.decode("utf-8"))
  token = body['token']
  user = database_helper.email_from_token(token)
  if user == None:
    return _return_json_message(False, "User not signed in")
  database_helper.post_message(user['email'], body['email'], body['message'])
  return _return_json_message(True, "Successfully posted message")

def _signin_user(email):
  token = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(20)])
  database_helper.signin(token, email)
  return token

def _return_json_message(success, message="", data=""):
  return jsonify({"success": success, "message": message, "data": data})

def _password_hasher(password):
  return hashlib.md5(password.encode("utf-8")).hexdigest()
