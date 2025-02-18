const axios = require("axios");

// Load API key from environment variable
const GEMINI_API_KEY = "AIzaSyCOSX_kqyRGqdjaCzA4gc_2LzxIigPAkC0";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" +
  GEMINI_API_KEY;

// 🚩 Scam Flags to Detect
const scamFlags = `
1️⃣ **Fake Authority Claims**:
   - The caller claims to be from TRAI, police, Cyber Crime, or RBI.
   - They mention legal terms like FIRs, arrest warrants, or money laundering.
2️⃣ **Fear and Urgency Tactics**:
   - Statements like "Your number is involved in illegal activities" or "You will be arrested soon."
   - Strict deadlines to create panic (e.g., "Your contacts will be disconnected in 2 hours").
3️⃣ **Request for Sensitive Information**:
   - Asking for bank details, Aadhaar number, PAN card.
   - Requesting OTPs, UPI details, or fund transfers for verification.
4️⃣ **Unusual Payment Requests**:
   - Asking the victim to transfer money to an unknown SBI bank account.
   - Claiming the transfer is for RBI verification (which is fake).
5️⃣ **Fake Video Calls for Credibility**:
   - Showing a person in a police uniform on WhatsApp video call.
   - Using fake case details to sound legitimate (e.g., Naresh Goyal’s money laundering case).
`;

// Function to analyze the call transcript for scam indicators
async function analyzeCallRecording(transcription) {
  try {
    console.log("Analyzing the transcription for scam indicators...");

    const prompt = `
        The following is a transcribed call recording between two people:
        --- 
        "${transcription}"
        ---
        Your task is to analyze whether this call exhibits scam behavior based on the following scam detection criteria:
        ${scamFlags}

        Instructions:
        - Identify if any scam indicators are present.
        - If a scam is detected, specify which scam flags are being violated.
        - If no scam is detected, provide a brief explanation.
        - Give a scam likelihood percentage (0-100%).
        - Conclude whether this is likely a scam call or not.

        Output format:
        - **Scam Likelihood**: X%
        - **Violations**: [List of violated flags]
        - **Analysis**: [Detailed explanation]
        - **Final Verdict**: [Is it a scam? Yes/No]
        `;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0
    ) {
      const analysis = response.data.candidates[0].content.parts[0].text;
      console.log("\n🔍 Scam Analysis Report:\n", analysis);
      return analysis;
    } else {
      throw new Error("Unexpected API response format");
    }
  } catch (error) {
    console.error(
      "Error analyzing transcription:",
      error.response?.data || error.message
    );
    return "Error processing scam analysis.";
  }
}

// Export function for external use
module.exports = { analyzeCallRecording };
