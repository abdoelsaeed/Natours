/* eslint-disable node/no-unsupported-features/es-syntax */
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.form = `Abdelrahman <${process.env.EMAIL_FORM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransport({
        service: 'gmail',
        host: process.env.GMAIL_HOST,
        port: process.env.GMAIL_PORT,
        secure: false, //! true for 465, false for other ports
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // eslint-disable-next-line no-unused-vars
  //send the actual email
  async send(template, subject) {
    //? 1) render Html based on pug templete
    //! you can't use res.render() because in email you can send html based on pug but in res.render you send pug based on html
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstname: this.firstname,
        url: this.url,
        subject
      }
    );
    // 2) Define email option
    const mailOptions = {
      from: this.form,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.htmlToText(html)
    };
    // 3) creatre a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (vaild for 10 miuntes)'
    );
  }
};
