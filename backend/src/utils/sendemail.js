import nodemailer from "nodemailer"
import { asyncHandler } from "./asyncHandler.js"
import { apiError } from "./apiError.js"

const sendMail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // true for port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });


        const mailOptions = {
            from: `"QuickFile" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        };

        const mail = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', mail.messageId);
        return mail;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new apiError(500, "Failed to send verification email");
    }
}

export {sendMail}