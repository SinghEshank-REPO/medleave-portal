import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { DocumentStatus } from '../types';

const GEMINI_API_KEY = env.GEMINI.API_KEY;

export interface AIAnalysisResult {
  patientName: string;
  doctorName: string;
  hospitalName: string;
  diagnosis: string;
  restDays: number;
  confidenceScore: number; // 0.00 to 1.00 (e.g. 0.95 = 95% Real / 95 out of 100)
  autoSummary: string;
  status: DocumentStatus;
  fraudAlerts: string[];
}

export class AIService {
  /**
   * Performs real visual OCR and authenticity analysis on a medical certificate using Google Gemini AI.
   * Gemini visually scans the uploaded image/PDF and decides the authenticity score out of 100.
   */
  static async analyzeCertificate(
    filePathOrUrl: string, 
    studentName: string,
    directPayload?: { base64Data: string; mimeType: string }
  ): Promise<AIAnalysisResult> {
    console.log(`[AIService] Starting Gemini AI visual scan for student "${studentName}" on file: ${filePathOrUrl}`);

    let base64Data: string | null = directPayload?.base64Data || null;
    let mimeType = directPayload?.mimeType || 'image/jpeg';

    if (!base64Data) {
      try {
        let targetPath = filePathOrUrl;
        if (filePathOrUrl.startsWith('/uploads/') || filePathOrUrl.startsWith('uploads/')) {
          const cleanPath = filePathOrUrl.startsWith('/') ? filePathOrUrl.substring(1) : filePathOrUrl;
          targetPath = path.resolve(process.cwd(), cleanPath);
        }

        if (fs.existsSync(targetPath)) {
          const buffer = fs.readFileSync(targetPath);
          base64Data = buffer.toString('base64');
          const ext = path.extname(targetPath).toLowerCase();
          if (ext === '.pdf') mimeType = 'application/pdf';
          else if (ext === '.png') mimeType = 'image/png';
          else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        } else if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
          const response = await fetch(filePathOrUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            base64Data = Buffer.from(arrayBuffer).toString('base64');
            const contentType = response.headers.get('content-type');
            if (contentType) mimeType = contentType;
          }
        }
      } catch (e) {
        console.error('[AIService] Failed to read uploaded file buffer for Gemini:', e);
      }
    }

    if (!base64Data) {
      console.error('[AIService] Could not resolve file buffer from disk. Defaulting score to 0.');
      return {
        patientName: 'N/A',
        doctorName: 'N/A',
        hospitalName: 'N/A',
        diagnosis: 'Unreadable / Missing Document File',
        restDays: 0,
        confidenceScore: 0.00,
        autoSummary: 'Uploaded file could not be read or was missing from local disk.',
        status: 'SUSPICIOUS',
        fraudAlerts: ['Uploaded document file was missing or unreadable.']
      };
    }

    const geminiModels = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    
    const promptText = `You are a professional medical document authenticity verification AI.
Examine this medical certificate image in detail. Read all visible text, doctor stamps, clinic/hospital names, signatures, patient details, and document layout.

Assess whether this is a genuine authentic medical certificate or a fake/edited/invalid/irrelevant document.
Verify expected student name: "${studentName}".

Rules for Authenticity Score (0 to 100):
- 0 to 15: Completely fake, blank image, food photo, non-medical document, or severely tampered file.
- 16 to 49: Highly suspicious, missing critical details (no doctor name/hospital), or patient name mismatch.
- 50 to 79: Partial medical document, missing official stamp or registration number.
- 80 to 100: Genuine authentic medical certificate from a doctor/hospital with clear diagnosis and matching patient name "${studentName}".

Output ONLY a valid raw JSON object (with no markdown fences) in this exact structure:
{
  "patientName": "Extracted Patient Name (or 'Unknown')",
  "doctorName": "Extracted Doctor Name (or 'N/A')",
  "hospitalName": "Extracted Hospital/Clinic Name (or 'N/A')",
  "diagnosis": "Extracted Diagnosis (or 'N/A')",
  "restDays": 0,
  "authenticityScore": 95, // Integer 0 to 100 decided by your visual evaluation
  "status": "VALID" or "SUSPICIOUS",
  "autoSummary": "Detailed visual analysis summary explaining your decision and score.",
  "fraudAlerts": ["List of any detected defects, mismatches, or non-medical content"]
}`;

    for (const model of geminiModels) {
      try {
        console.log(`[AIService] Sending visual prompt & image payload to Gemini API (${model})...`);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }],
            generationConfig: { response_mime_type: 'application/json' }
          })
        });

        if (res.ok) {
          const data: any = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);

            const scoreRaw = Number(parsed.authenticityScore !== undefined ? parsed.authenticityScore : 0);
            const scoreVal = Math.min(100, Math.max(0, scoreRaw));
            const normalizedConfidence = parseFloat((scoreVal / 100).toFixed(2));

            console.log(`[AIService] Gemini AI (${model}) visual scan complete! Score: ${scoreVal}/100 (${scoreVal}% Real), Status: ${parsed.status}`);

            return {
              patientName: parsed.patientName || 'Unknown',
              doctorName: parsed.doctorName || 'N/A',
              hospitalName: parsed.hospitalName || 'N/A',
              diagnosis: parsed.diagnosis || 'N/A',
              restDays: Number(parsed.restDays) || 0,
              confidenceScore: normalizedConfidence,
              autoSummary: parsed.autoSummary || `Gemini visual analysis completed. Score: ${scoreVal}% Real.`,
              status: parsed.status === 'VALID' && scoreVal >= 75 ? 'VALID' : 'SUSPICIOUS',
              fraudAlerts: parsed.fraudAlerts || []
            };
          }
        } else {
          console.warn(`[AIService] Gemini API (${model}) returned HTTP status ${res.status}:`, await res.text());
        }
      } catch (err) {
        console.error(`[AIService] Error executing Gemini model ${model}:`, err);
      }
    }

    // Fallback if API key fails or network is disconnected (Returns 0/100, NEVER fake 99% scores)
    console.warn('[AIService] Gemini API visual scan unavailable. Defaulting to 0/100 unverified.');
    return {
      patientName: studentName,
      doctorName: 'N/A',
      hospitalName: 'N/A',
      diagnosis: 'AI Visual Verification Pending',
      restDays: 0,
      confidenceScore: 0.00,
      autoSummary: 'Gemini AI API connection could not be completed. Document requires manual review.',
      status: 'SUSPICIOUS',
      fraudAlerts: ['Gemini API scanning connection failed. Manual review required.']
    };
  }
}
