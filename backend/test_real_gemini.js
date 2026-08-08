import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the root or local folder
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

async function testGeminiScan() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const sampleImagePath = path.resolve(process.cwd(), 'uploads/1781206892612-39360629.jpg');

  console.log('Testing image path:', sampleImagePath);
  console.log('Exists:', fs.existsSync(sampleImagePath));

  if (!fs.existsSync(sampleImagePath)) {
    console.error('Sample image not found on disk!');
    return;
  }

  const imageBuffer = fs.readFileSync(sampleImagePath);
  const base64Data = imageBuffer.toString('base64');
  console.log('Image Base64 length:', base64Data.length);

  const promptText = `You are a professional medical document authenticity verification AI.
Examine this medical certificate image in detail. Read all visible text, doctor stamps, clinic/hospital names, signatures, patient details, and document layout.

Assess whether this is a genuine authentic medical certificate or a fake/edited/invalid document.
Verify expected student name: "Aditya Sen".

Rules for Authenticity Score (0 to 100):
- 0 to 20: Completely fake, blank image, non-medical document, or severely tampered.
- 21 to 50: Highly suspicious, missing critical details (no doctor name/hospital), or patient name mismatch.
- 51 to 79: Partial medical document, missing official stamp or registration number.
- 80 to 100: Genuine authentic medical certificate from a doctor/hospital with clear diagnosis and matching patient name.

Output ONLY a valid raw JSON object (with no markdown fences) in this structure:
{
  "patientName": "Extracted Patient Name",
  "doctorName": "Extracted Doctor Name",
  "hospitalName": "Extracted Hospital/Clinic Name",
  "diagnosis": "Extracted Diagnosis",
  "restDays": 3,
  "authenticityScore": 95, // Integer 0 to 100 decided by your visual evaluation
  "status": "VALID" or "SUSPICIOUS",
  "autoSummary": "Detailed visual analysis summary explaining your decision and score.",
  "fraudAlerts": ["List of any detected defects or mismatches"]
}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: { response_mime_type: 'application/json' }
      })
    });

    console.log('HTTP Response Status:', res.status);
    const data = await res.json();
    console.log('FULL GEMINI RESPONSE:\n', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testGeminiScan();
