from flask import Flask, request, jsonify
import random
import string
import database_helper
import secrets
import hashlib
import json
app = Flask(__name__)

@app.route("/")
def hello():
  return "Hello World!"

@app.route('/sign_in', methods=['POST'])
def sign_in():
  body = json.loads(request.data.decode("utf-8"))
  password = _password_hasher(body['password'])
  result = database_helper.find_user_with_password(body['email'], password)
  if result != None:
    token = _signin_user(body['email'])
    return _return_json_message(True, "Successfully logged in", {"token": token})
  else:
    return _return_json_message(False, "No such user")

@app.route('/sign_up', methods=['POST'])
def sign_up():
  body = json.loads(request.data.decode("utf-8"))
  print(body)
  data = body['data']
  print(data['password'])
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


def _signin_user(email):
  token = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(20)])
  database_helper.signin(token, email)
  return token

def _return_json_message(success, message="", data=""):
  return jsonify({"success": success, "message": message, "data": data})

def _password_hasher(password):
  return hashlib.md5(password.encode("utf-8")).hexdigest()


if __name__ == '__main__':
  app.run(host="0.0.0.0", debug=True)
