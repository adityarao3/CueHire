import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { feedbackId, candidateEmail, candidateName, totalScore, recommendedAction, finalAssessment, categoryScores, strengths, areasForImprovement, interviewRole } = await req.json();

    if (!feedbackId || !candidateEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify admin credentials are configured
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: "Email not configured. Add SMTP_USER and SMTP_PASS to .env.local" },
        { status: 500 }
      );
    }

    // Generate score bars HTML
    const categoryHTML = (categoryScores || [])
      .map((cat: { name: string; score: number; comment: string }) => {
        const barColor =
          cat.score >= 80 ? "#2ECC71" : cat.score >= 60 ? "#F5B731" : cat.score >= 40 ? "#F97316" : "#E85D75";
        return `
        <tr>
          <td style="padding: 14px 20px; border-bottom: 1px solid #F3F4F6;">
            <div style="font-weight: 600; color: #1A1A2E; margin-bottom: 6px;">${cat.name}</div>
            <div style="background: #F3F4F6; border-radius: 8px; height: 8px; margin-bottom: 6px;">
              <div style="background: ${barColor}; border-radius: 8px; height: 8px; width: ${cat.score}%;"></div>
            </div>
            <div style="color: #6B7280; font-size: 13px; line-height: 1.5;">${cat.comment}</div>
          </td>
          <td style="padding: 14px 20px; border-bottom: 1px solid #F3F4F6; text-align: center; width: 80px;">
            <span style="font-size: 20px; font-weight: 700; color: ${barColor};">${cat.score}</span>
            <span style="font-size: 12px; color: #9CA3AF;">/100</span>
          </td>
        </tr>`;
      })
      .join("");

    const strengthsHTML = (strengths || [])
      .map((s: string) => `<li style="color: #374151; padding: 4px 0;">${s}</li>`)
      .join("");

    const improvementsHTML = (areasForImprovement || [])
      .map((a: string) => `<li style="color: #374151; padding: 4px 0;">${a}</li>`)
      .join("");

    const actionColor =
      recommendedAction === "Strong Hire" || recommendedAction === "Hire"
        ? "#2ECC71"
        : recommendedAction === "Maybe"
        ? "#F5B731"
        : "#E85D75";

    // Build the email HTML
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAFBFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFBFF; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1A1A2E, #2D2D3F); padding: 32px 40px; text-align: center;">
                  <h1 style="color: #F5B731; margin: 0; font-size: 24px; font-weight: 700;">CueHire</h1>
                  <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">AI-Powered Tutor Screening Platform</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="color: #1A1A2E; font-size: 16px; margin: 0 0 8px;">Dear <strong>${candidateName}</strong>,</p>
                  <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                    Thank you for taking the time to complete the screening interview for the 
                    <strong style="color: #1A1A2E;">${interviewRole || "Tutor"}</strong> position at Cuemath. 
                    We appreciate your interest and the effort you invested.
                  </p>

                  <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                    After a thorough review of your assessment, we regret to inform you that we are unable to move forward 
                    with your application at this time. Below is a summary of your assessment for your reference.
                  </p>

                  <!-- Score Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: #FAFBFF; border-radius: 12px; border: 1px solid #E5E7EB; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 24px; text-align: center;">
                        <div style="font-size: 48px; font-weight: 700; color: ${actionColor};">${totalScore}</div>
                        <div style="font-size: 13px; color: #9CA3AF; margin-top: 4px;">Overall Score /100</div>
                        <div style="margin-top: 12px;">
                          <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; color: white; background: ${actionColor};">
                            ${recommendedAction || "Under Review"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Assessment Summary -->
                  <div style="margin-bottom: 24px;">
                    <h3 style="color: #1A1A2E; font-size: 16px; margin: 0 0 8px;">Assessment Summary</h3>
                    <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0;">${finalAssessment}</p>
                  </div>

                  <!-- Category Breakdown -->
                  <h3 style="color: #1A1A2E; font-size: 16px; margin: 0 0 12px;">Detailed Breakdown</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; border: 1px solid #E5E7EB; margin-bottom: 24px;">
                    ${categoryHTML}
                  </table>

                  <!-- Strengths -->
                  ${strengthsHTML ? `
                  <div style="margin-bottom: 20px;">
                    <h3 style="color: #2ECC71; font-size: 15px; margin: 0 0 8px;">Strengths</h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                      ${strengthsHTML}
                    </ul>
                  </div>` : ""}

                  <!-- Areas for Improvement -->
                  ${improvementsHTML ? `
                  <div style="margin-bottom: 24px;">
                    <h3 style="color: #E5A820; font-size: 15px; margin: 0 0 8px;">Areas for Improvement</h3>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                      ${improvementsHTML}
                    </ul>
                  </div>` : ""}

                  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />

                  <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                    We encourage you to continue developing your skills, and you are welcome to apply again in the future. 
                    If you have any questions, feel free to reach out to our recruitment team.
                  </p>

                  <p style="color: #1A1A2E; font-size: 14px; margin: 24px 0 0;">
                    Best regards,<br/>
                    <strong>The Cuemath Recruitment Team</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #F9FAFB; padding: 20px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
                  <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                    This is an automated assessment report from CueHire. 
                    &copy; ${new Date().getFullYear()} Cuemath. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: `"CueHire - Cuemath Recruitment" <${smtpUser}>`,
      to: candidateEmail,
      subject: `Your CueHire Screening Assessment — ${interviewRole || "Tutor"} Position`,
      html: emailHTML,
    });

    // Mark feedback as email sent
    await db.collection("feedback").doc(feedbackId).update({
      rejectionEmailSent: true,
      rejectionEmailSentAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
