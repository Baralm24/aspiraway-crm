export async function sendSessionToGoogleSheets(sessionPayload: any) {
  // Support both Client-side (NEXT_PUBLIC_) and Server-side environment variables
  const webhookUrl =
    process.env.NEXT_PUBLIC_SESSION_DB_WEBHOOK_URL ||
    process.env.SESSION_DB_WEBHOOK_URL;

  console.log("--> Triggering Webhook URL:", webhookUrl);

  if (!webhookUrl) {
    console.error(
      "❌ Missing NEXT_PUBLIC_SESSION_DB_WEBHOOK_URL in environment variables."
    );
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      // Using text/plain prevents CORS preflight issues with Google Apps Script
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        sessionId:
          sessionPayload.sessionId ||
          `ASP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: sessionPayload.createdAt || new Date().toISOString(),
        mentorName: sessionPayload.mentorName || "",
        mentorEmail: sessionPayload.mentorEmail || "",
        studentName: sessionPayload.studentName || "",
        studentEmail: sessionPayload.studentEmail || "",
        country: sessionPayload.country || "USA",
        topic: sessionPayload.topic || "",
        scheduledTime: sessionPayload.scheduledTime || "",
        meetingLink: sessionPayload.meetingLink || "",
        mentorCheckinTime: sessionPayload.mentorCheckinTime || null,
        studentCheckinTime: sessionPayload.studentCheckinTime || null,
        actualStartTime: sessionPayload.actualStartTime || null,
        actualEndTime: sessionPayload.actualEndTime || null,
        durationMinutes: sessionPayload.durationMinutes || null,
        topicsCovered: sessionPayload.topicsCovered || "",
        studentConcern: sessionPayload.studentConcern || "",
        followUpRecommended: sessionPayload.followUpRecommended || false,
        followUpDetail: sessionPayload.followUpDetail || "",
        mentorNotes: sessionPayload.mentorNotes || "",
        studentRating: sessionPayload.studentRating || null,
        studentFeedback: sessionPayload.studentFeedback || "",
        status: sessionPayload.status || "Pending",
        urgency: sessionPayload.urgency || "NORMAL",
        bothIn: sessionPayload.bothIn || false,
      }),
    });

    const rawText = await response.text();
    
    // Safely attempt to parse JSON response from Apps Script
    try {
      const result = JSON.parse(rawText);
      console.log("✅ Google Sheets Sync Result:", result);
      return result;
    } catch {
      console.log("✅ Google Sheets Sync Raw Response:", rawText);
      return rawText;
    }
  } catch (error) {
    console.error("❌ Failed to sync session to Google Sheets:", error);
  }
}