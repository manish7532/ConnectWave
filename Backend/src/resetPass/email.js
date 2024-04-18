import dotenv from 'dotenv';
import nodemailer from 'nodemailer'

dotenv.config();

const sendEmail = (mailOptions) => {

    //crrate transporter
    const transporter = nodemailer.createTransport({
        // service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    })


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export { sendEmail }