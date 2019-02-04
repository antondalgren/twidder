from flask import Flask
from flask import request
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route('/sign_in', methods=['POST'])
def s_in():
    if valid_login(request.form['email'],
                    request.form['password']):
        # Skapa token till användare
        return log_the_user_in(request.form['username'])
    else:
        error = 'Invalid username/password'
