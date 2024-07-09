/* eslint-disable import/prefer-default-export */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
/* eslint-disable node/no-unsupported-features/es-syntax */

const updateSetting = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatepassword'
        : '/api/v1/users/updateme';
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

if (document.querySelector('.form-user-data')) {
  document
    .querySelector('.form-user-data')
    .addEventListener('submit', async e => {
      e.preventDefault();
      //عشان الصوره تشتغل لازم تعمل بتاعت newform لي مش عارف
      const form = new FormData();
      document.querySelector('.btn--save--data').textContent = 'Updatting...';
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);
      await updateSetting(form, 'data');
      document.querySelector('.btn--save--data').textContent = 'SAVE SETTINGS';
    });
}

if (document.querySelector('.form-user-settings')) {
  document
    .querySelector('.form-user-settings')
    .addEventListener('submit', async e => {
      e.preventDefault();
      // eslint-disable-next-line prettier/prettier
      document.querySelector('.btn--save--password').textContent = 'Updatting...';
      const password = document.getElementById('password-current').value;
      const newPassword = document.getElementById('password').value;
      const confirmNewPassword = document.getElementById('password-confirm')
        .value;
      await updateSetting(
        { password, newPassword, confirmNewPassword },
        'password'
      );
      document.querySelector('.btn--save--password').textContent =
        'SAVE PASSWORD';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
}
