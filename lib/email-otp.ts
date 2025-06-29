import nodemailer from "nodemailer"

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number.parseInt(process.env.EMAIL_SERVER_PORT!),
    secure: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  })
}

export async function sendOTPEmail(email: string, firstName: string, otp: string) {
  const transporter = createTransporter()

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alumni Login OTP</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f8fafc;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .otp-code {
          background: #10b981;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 4px;
        }
        .warning-box {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">🎓 Bugema University</div>
        <h1>Alumni Dashboard Login</h1>
      </div>
      
      <div class="content">
        <h2>Hello ${firstName}!</h2>
        
        <p>You requested to login to your Alumni Dashboard. Use the OTP code below to complete your login:</p>
        
        <div class="otp-code">${otp}</div>
        
        <div class="warning-box">
          <h4>⚠️ Security Notice</h4>
          <p>This OTP code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this login, please ignore this email.</p>
        </div>
        
        <p>Best regards,<br>
        <strong>Bugema University Alumni Office</strong></p>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: {
      name: "Bugema University Alumni Office",
      address: process.env.EMAIL_SERVER_USER!,
    },
    to: email,
    subject: "🔐 Alumni Dashboard Login OTP",
    html: htmlContent,
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    console.log("OTP email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending OTP email:", error)
    throw error
  }
}
