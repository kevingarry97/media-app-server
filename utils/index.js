const sgMail = require('@sendgrid/mail');
const config = require('config');

const apiKey = config.get('sendgridApiKey');

sgMail.setApiKey(apiKey);

function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    sgMail.send(mailOptions, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
  });
}

module.exports = { sendEmail }