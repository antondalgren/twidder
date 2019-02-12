
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
  login.onsubmit = async (event) => {
    event.preventDefault()
    hideError()
    const email = event.target.email.value
    const password = event.target.password.value

    if (!isPasswordLengthOk(password)) {
      displayError('Error: Your password is to short', 'login-error')
    } else {
      let res = await APILogin(email, password)
      if (!res.success) {
        displayError(res.message, 'login-error')
      } else {
        setToken(res.data)
        loadView()
      }
    }
  }

  const signup = document.getElementById('signup-form')
  signup.onsubmit = async (event) => {
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
      let res = await APISignup(data)
      if (!res.success) {
        displayError(res.message, 'signup-error')
      } else {
        res = await APILogin(data.email, data.password)
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
  initiateHomeTab()
  initiateBrowseTab()
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

async function initiateHomeTab () {
  let form = document.getElementById('post-message-form')
  let token = getToken()
  let user = await APIUserData(token)
  form.onsubmit = async (event) => {
    event.preventDefault()
    await APIPostMessage(token, event.target.message.value, user.data.email)
    await loadMessages(token, user.data.email, 'home')
    document.getElementById('message').value = ''
  }

  let reload = document.getElementById('reload-messages-form')
  reload.onsubmit = async (event) => {
    event.preventDefault()
    await loadMessages(token, user.data.email, 'home')
  }
  await loadMessages(token, user.data.email, 'home')
  await loadUserInfo(token, user.data.email, 'home')
}

async function loadMessages (token, email, sectionName) {
  let res = await APIGetMessages(token, email)
  let messageContainer = document.getElementById(sectionName).getElementsByClassName('message-container')
  messageContainer[0].innerHTML = ''
  res.data.forEach(message => {
    messageContainer[0].innerHTML += '<p>From: ' + message.from_email + ' Message: ' + message.message + '</p>'
  })
}

async function loadUserInfo (token, email, sectionName) {
  let res = await APIUserDataByEmail(token, email)
  let infoContainer = document.getElementById(sectionName).getElementsByClassName('user-info')
  infoContainer[0].innerHTML = ''
  infoContainer[0].innerHTML = '<span class="user-header"> Email: </span> <span class="user-data user-email">' + res.data.email + '</span>'
  infoContainer[0].innerHTML += '<span class="user-header"> Name: </span> <span class="user-data">' + res.data.firstname + '</span>'
  infoContainer[0].innerHTML += '<span class="user-header"> Lastname: </span> <span class="user-data">' + res.data.familyname + '</span>'
  infoContainer[0].innerHTML += '<span class="user-header"> City: </span> <span class="user-data">' + res.data.city + '</span>'
  infoContainer[0].innerHTML += '<span class="user-header"> Country: </span> <span class="user-data">' + res.data.country + '</span>'
  infoContainer[0].innerHTML += '<span class="user-header"> Gender: </span> <span class="user-data">' + res.data.gender + '</span>'
}

function initiateAccountTab () {
  let form = document.getElementById('change-password-form')
  form.onsubmit = async (event) => {
    event.preventDefault()
    hideError()
    if (!isPasswordLengthOk(event.target.password.value)) {
      displayError('Error: Your password is to short', 'change-password-error')
    } else if (!isPasswordsEqual(event.target.password.value, event.target.repeatPassword.value)) {
      displayError('Error: Your passwords does not match', 'change-password-error')
    } else {
      let res = await APIChangePassword(getToken(), event.target.oldPassword.value, event.target.password.value)
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

function initiateBrowseTab () {
  let form = document.getElementById('search-user-form')
  let token = getToken()
  form.onsubmit = async (event) => {
    event.preventDefault()
    hideError()
    let res = await APIUserDataByEmail(token, event.target.email.value)
    if (!res.success) {
      displayError(res.message, 'search-error')
    } else {
      await loadMessages(token, event.target.email.value, 'browse')
      await loadUserInfo(token, event.target.email.value, 'browse')
    }
  }
  let messageForm = document.getElementById('post-message-to-user-form')
  messageForm.onsubmit = async (event) => {
    event.preventDefault()
    let targetEmail = document.getElementById('browse').getElementsByClassName('user-email')[0].innerText
    await APIPostMessage(token, event.target.message.value, targetEmail)
    await loadMessages(token, targetEmail, 'browse')
    document.getElementById('message-to-user').value = ''
  }

  let reload = document.getElementById('reload-messages-form')
  reload.onsubmit = async (event) => {
    event.preventDefault()
    let targetEmail = document.getElementById('browse').getElementsByClassName('user-email')[0].innerText
    await loadMessages(token, targetEmail, 'browse')
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

async function APILogin (email, password) {
  return fetch('http://localhost:5000/sign_in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Accept': 'application/json' },
    body: JSON.stringify({ email: email, password: password })
  }).then(response => {
    return response.json()
  }).then(res => {
    return res
  })
  //return serverstub.signIn(email, password)
}

function APISignup (data) {
  return fetch('http://localhost:5000/sign_up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Accept': 'application/json' },
    body: JSON.stringify({ data: data })
  }).then(response => {
    return response.json()
  }).then(res => {
    return res
  })
  //return serverstub.signUp(data)
}

function APIChangePassword (token, oldPassword, newPassword) {
  return fetch('http://localhost:5000/change_password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Accept': 'application/json' },
    body: JSON.stringify({ token: token, oldPassword: oldPassword, newPassword: newPassword })
  }).then(response => {
    return response.json()
  }).then(res => {
    return res
  })
  //return serverstub.changePassword(token, oldPassword, newPassword)
}

function APISignout (token) {
  return fetch('http://localhost:5000/sign_out', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Accept': 'application/json' },
    body: JSON.stringify({ token: token })
  }).then(response => {
    return response.json()
  }).then(res => {
    return res
  })
  //return serverstub.signOut(token)
}

function APIUserData (token) {
  return fetch('http://localhost:5000/get_user_data_by_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Accept': 'application/json' },
    body: JSON.stringify({ token: token })
  }).then(response => {
    return response.json()
  }).then(res => {
    return res
  })
  //return serverstub.getUserDataByToken(token)
}

function APIPostMessage (token, message, email) {
  return fetch('http://localhost:5000/post_message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Accept': 'application/json' },
    body: JSON.stringify({ token: token, email: email, message: message })
  }).then(response => {
    return response.json()
  }).then(res => {
    return res
  })
  //return serverstub.postMessage(token, message, email)
}

function APIGetMessages(token, email) {
  return fetch('http://localhost:5000/get_messages_by_email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Accept': 'application/json' },
    body: JSON.stringify({ token: token, email: email })
  }).then(response => {
    return response.json()
  }).then(res => {
    return res
  })
  //return serverstub.getUserMessagesByEmail(token, email)
}

function APIUserDataByEmail(token, email) {
  return fetch('http://localhost:5000/get_user_data_by_email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Accept': 'application/json' },
    body: JSON.stringify({ token: token, email: email })
  }).then(response => {
    return response.json()
  }).then(res => {
    return res
  })
  //return serverstub.getUserDataByEmail(token, email)
}
