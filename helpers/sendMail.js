const nodemailer = require("nodemailer");
module.exports = {
  sendMail: (data) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      port: 3000,
      tls: true,
      auth: {
        user: process.env.FROM_EMAIL, // set config.env file email
        pass: process.env.PASSWORD, // 16 digit generate password of email
      },
    });

    var mailOptions = {
      from: process.env.FROM_EMAIL,
      to: `${data.email}`,
      subject: `[User Credential] You have Successfully register!`,
      html: `Hi <b> ${data.fistName} ${data.lastName}</b>, <br><br>
                       Your email: ${data.email}<br><br>

                       Your password: ${data.password}<br><br>
                       
                       Regards<br><br>
                       Team Techstaunch ! `,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail Sent", info.response);
      }
    });
  },
};
