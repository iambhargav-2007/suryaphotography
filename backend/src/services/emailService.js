import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
  if (!to) {
    console.warn(`No email address provided for subject: "${subject}". Skipping email send.`);
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('SMTP credentials not provided. Mocking email send:');
    console.log(`[EMAIL to ${to}]: ${subject}\n${text}`);
    return;
  }

  try {
    const transporterOptions = {
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    };

    if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail.com')) {
      transporterOptions.service = 'gmail';
    } else {
      transporterOptions.host = process.env.SMTP_HOST;
      transporterOptions.port = process.env.SMTP_PORT || 587;
      transporterOptions.secure = false;
    }

    const transporter = nodemailer.createTransport(transporterOptions);

    const info = await transporter.sendMail({
      from: `"Surya Photography" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
