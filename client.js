
window.onload = () => {
  loadView()
}

function loadView () {
  if (!isLoggedin()) {
    loadWelcome()
  } else {
    loadProfile()
  }
}

function isPasswordLengthOk (password) {
  return password.length > 3
}

function isPasswordsEqual (password, repeatPassword) {
  return password === repeatPassword
}

function displayError (message, elementID) {
  let error = document.getElementById(elementID)
  error.innerText = message
  error.style.display = 'inline'
}

function hideError () {
  let errors = document.getElementsByClassName('error')
  console.log(errors)
  for (let error of errors) {
    error.innerText = ''
    error.style.display = 'none'
  }
}

function isLoggedin () {
  return window.localStorage.getItem('token') !== null
}

function setToken (token) {
  window.localStorage.setItem('token', token)
}

function getToken () {
  return window.localStorage.getItem('token')
}

function clearToken () {
  window.localStorage.removeItem('token')
}

function loadWelcome () {
  document.getElementById('content').innerHTML = document.getElementById('welcome-view').innerHTML
  let login = document.getElementById('login-form')
  login.onsubmit = (event) => {
    event.preventDefault()
    hideError()
    const email = event.target.email.value
    const password = event.target.password.value

    if (!isPasswordLengthOk(password)) {
      displayError('Error: Your password is to short', 'login-error')
    } else {
      let res = APILogin(email, password)
      if (!res.success) {
        displayError(res.message, 'login-error')
      } else {
        setToken(res.data)
        loadView()
      }
    }
  }

  const signup = document.getElementById('signup-form')
  signup.onsubmit = (event) => {
    event.preventDefault()
    hideError()
    if (!isPasswordLengthOk(event.target.password.value)) {
      displayError('Error: Your password is to short', 'signup-error')
    } else if (!isPasswordsEqual(event.target.password.value, event.target.repeatPassword.value)) {
      displayError('Error: Your passwords does not match', 'signup-error')
    } else {
      const data = {
        email: event.target.email.value,
        password: event.target.password.value,
        firstname: event.target.firstname.value,
        familyname: event.target.familyname.value,
        gender: event.target.gender.value,
        city: event.target.city.value,
        country: event.target.country.value
      }
      let res = APISignup(data)
      if (!res.success) {
        displayError(res.message, 'signup-error')
      } else {
        res = APILogin(data.email, data.password)
        if (!res.success) {
          displayError(res.message, 'signup-error')
        } else {
          setToken(res.data)
          loadView()
        }
      }
    }
  }
}

function loadProfile () {
  document.getElementById('content').innerHTML = document.getElementById('profile-view').innerHTML
  initiateTabs()
  initiateAccountTab()
}

function initiateTabs () {
  let tabs = document.getElementsByClassName('tablink')
  for (let tab of tabs) {
    tab.onclick = (event) => {
      clearActiveClass()
      hideAllContent()
      tab.className += ' active'
      showContent(event.target.innerHTML.toLowerCase())
    }
  }
}

function initiateAccountTab () {
  let form = document.getElementById('change-password-form')
  form.onsubmit = (event) => {
    event.preventDefault()
    hideError()
    if (!isPasswordLengthOk(event.target.password.value)) {
      displayError('Error: Your password is to short', 'change-password-error')
    } else if (!isPasswordsEqual(event.target.password.value, event.target.repeatPassword.value)) {
      displayError('Error: Your passwords does not match', 'change-password-error')
    } else {
      let res = APIChangePassword(getToken(), event.target.oldPassword.value, event.target.password.value)
      if (!res.success) {
        displayError(res.message, 'change-password-error')
      }
    }
  }

  let signout = document.getElementById('signout-form')
  signout.onsubmit = (event) => {
    event.preventDefault()
    APISignout(getToken())
    clearToken()
    loadView()
  }
}

function clearActiveClass () {
  let tablinks = document.getElementsByClassName('tablink')
  for (let link of tablinks) {
    link.className = link.className.replace(' active', '')
  }
}

function hideAllContent () {
  let contents = document.getElementsByClassName('content')
  for (let content of contents) {
    content.style.display = 'none'
  }
}

function showContent (name) {
  let content = document.getElementById(name)
  content.style.display = 'grid'
}

function APILogin (email, password) {
  return serverstub.signIn(email, password)
}

function APISignup (data) {
  return serverstub.signUp(data)
}

function APIChangePassword(token, oldPassword, newPassword) {
  return serverstub.changePassword(token, oldPassword, newPassword)
}

function APISignout (token) {
  return serverstub.signOut(token)
}