const nodemailer = require('nodemailer');

// ----- nodemailer -----
const sendEmail = async (options) => {
    // 1) create a transporter ( service that will send emails like: "gmail","Mailgun","mialtrap","sendGrid")
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, // if secure false port = 587 ,if secure true port = 465
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    // 2) Define email options (lile: "from","to","subject","message")
    const mailOptions = {
        from: 'E-Shop App <t.devmail.0110@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    //3)send email
    await transporter.sendMail(mailOptions);
}


module.exports = sendEmail;