"use strict";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import nodemailer from "nodemailer";
import ejs from "ejs";
/**
 * sendEmail
 * @param {Object} mailObj - Email information
 * @param {String} from - Email address of the sender
 * @param {Array} to - Array of receipents email address
 * @param {String} subject - Subject of the email
 * @param {String} text - Email body
 */
const sendEmail = async (mailObj) => {
  const { from, subject, text } = mailObj;

  try {
    // Create a transporter
    let transporter = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });
    ejs.renderFile(
      __dirname + "/../views/mail/contact.ejs",
      {
        from,
        text,
      },
      {},
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let mainOptions = {
            from: process.env.USER,
            to: [process.env.USER],
            subject: subject,
            text: text,
            html: data,
          };
          transporter.sendMail(mainOptions, (err, info) => {
            if (err)
              throw new Error(
                `Something went wrong in the sendmail method. Error: ${err.message}`
              );
            else {
              console.log(info);
            }
          });
        }
      }
    );
    return true;
  } catch (error) {
    console.error(error);
    throw new Error(
      `Something went wrong in the sendmail method. Error: ${error.message}`
    );
  }
};

export default sendEmail;
