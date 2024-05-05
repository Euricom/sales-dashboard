import nodemailer from "nodemailer";
import { env } from "~/env";

export default  function sendMail(name: string, description: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: env.MAIL_USER,
          pass: env.MAIL_PASS,
        },
      });
    
      const mailOptions = {
        from: env.MAIL_USER,
        to: env.MAIL_RECEIVER,
        subject: "Bug report",
        text: `Name: ${name}\nDescription: ${description}`,
      };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
  }