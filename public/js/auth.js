/* eslint-disable no-use-before-define */
/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};
// type is 'success' or 'error'
const showAlert = (type, message) => {
  hideAlert();
  const markUp = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markUp);
  window.setTimeout(hideAlert, 5000);
};
const login = async (email, password) => {
  //دي بتخلي الداتا اللي تكتبها في الحقول تروح ل endpoint اللي في الurl
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Log In Successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (e) {
    showAlert('error', e.response.data.message);
  }
};

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if (res.data.status === 'success') {
      location.assign('/');
    }
  } catch (e) {
    showAlert('error', 'error logging out! try again');
  }
};

const resetpassword = async (password, confirmPassword) => {
  try {
    const path = window.location.href;
    url = path.split('/');
    token = url[url.length - 1];
    console.log(token);
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetpassword/${token}`,
      data: {
        password,
        confirmPassword
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'New Password was successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 5000);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data.message);
  }
};
const loved = async tourId => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/loved/${tourId}`,
      data: {
        tourId
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'You Loved Tour Successfully');
      window.setTimeout(() => {}, 1000);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data.message);
  }
};

const signUp = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        confirmPassword
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Sign Up Successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data.message);
  }
};

const forgetPassword = async email => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/users/forgotpassword`,
      data: {
        email
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'We send email successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data.message);
  }
};

if (document.querySelector('.form--forget')) {
  document.querySelector('.form--forget').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgetPassword(email);
  });
}
if (document.querySelector('.form--login')) {
  document.querySelector('.form--login').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const passsword = document.getElementById('password').value;
    login(email, passsword);
  });
}

if (document.querySelector('.form--reset')) {
  document.querySelector('.form--reset').addEventListener('submit', e => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    resetpassword(password, confirmPassword);
  });
}
if (document.querySelector('.nav__el--logout')) {
  document.querySelector('.nav__el--logout').addEventListener('click', logout);
}

if (document.querySelector('.form--signup')) {
  document.querySelector('.form--signup').addEventListener('submit', e => {
    e.preventDefault();
    console.log('12');
    const name = document.getElementById('name').value;
    console.log(name);

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    console.log(name);
    signUp(name, email, password, confirmPassword);
  });
}
if (document.querySelectorAll('.btn--white')) {
  document.querySelectorAll('.btn--white').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.target.style.backgroundColor = '#ff90a0';
      const { tourId } = e.target.dataset;
      loved(tourId);
    });
  });
}
