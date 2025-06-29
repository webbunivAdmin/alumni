import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import nodemailer from "nodemailer"

const createTransporter = () => {
  return nodemailer.createTransporter({
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reason } = await request.json()
    const { db } = await connectToDatabase()

    if (!reason?.trim()) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    const alumni = await db.collection("alumni").findOne({
      _id: new ObjectId(params.id),
    })

    if (!alumni) {
      return NextResponse.json({ error: "Alumni not found" }, { status: 404 })
    }

    // Update alumni status
    await db.collection("alumni").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          "metadata.status": "rejected",
          "metadata.lastUpdated": new Date(),
          "metadata.rejectionReason": reason,
        },
      },
    )

    // Send rejection email
    const transporter = createTransporter()
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alumni Registration Update</title>
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
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
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
          .reason-box {
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">🎓 Bugema University</div>
          <h1>Alumni Registration Update</h1>
        </div>
        
        <div class="content">
          <h2>Dear ${alumni.personalInfo.firstName} ${alumni.personalInfo.lastName},</h2>
          
          <p>Thank you for your interest in joining the Bugema University Alumni Association.</p>
          
          <p>After careful review of your application, we regret to inform you that your alumni registration has not been approved at this time.</p>
          
          <div class="reason-box">
            <h4>Reason for rejection:</h4>
            <p>${reason}</p>
          </div>
          
          <p>If you believe this decision was made in error or if you have additional information that might support your application, please contact our Alumni Office.</p>
          
          <p>Contact Information:</p>
          <p>
            📧 Email: alumni@bugemauniv.ac.ug<br>
            📞 Phone: +256-414-540-822<br>
            🌐 Website: https://bugemauniv.ac.ug/alumni
          </p>
          
          <p>Thank you for your understanding.</p>
          
          <p>Best regards,<br>
          <strong>Bugema University Alumni Office</strong></p>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: {
        name: "Bugema University Alumni Office",
        address: process.env.EMAIL_SERVER_USER!,
      },
      to: alumni.personalInfo.email,
      subject: "Alumni Registration Update - Application Not Approved",
      html: htmlContent,
    })

    return NextResponse.json({ message: "Alumni rejected successfully" })
  } catch (error) {
    console.error("Error rejecting alumni:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
