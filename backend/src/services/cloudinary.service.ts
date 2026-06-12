import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary only if not mock
const isMock = env.CLOUDINARY.CLOUD_NAME === 'mock';

if (!isMock) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY.CLOUD_NAME,
    api_key: env.CLOUDINARY.API_KEY,
    api_secret: env.CLOUDINARY.API_SECRET
  });
}

export class FileStorageService {
  /**
   * Uploads a local file to Cloudinary or returns a simulated local path if mock is enabled
   * @param localFilePath Path to the file uploaded by Multer
   * @returns object containing url and public_id
   */
  static async uploadFile(localFilePath: string, originalName: string): Promise<{ url: string; publicId: string }> {
    if (isMock) {
      console.log(`[FileStorageService] Mock mode: Simulating upload of ${originalName}`);
      
      // Ensure the mock upload output directory exists (static assets served by Express)
      const mockDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(mockDir)) {
        fs.mkdirSync(mockDir, { recursive: true });
      }

      // Generate a unique file name
      const ext = path.extname(originalName);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const destPath = path.join(mockDir, uniqueName);

      // Copy the file from temp to public upload folder
      fs.copyFileSync(localFilePath, destPath);

      // Clean up the temporary file (multer's tmp upload)
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('Failed to clean up temp file:', err);
      }

      return {
        url: `/uploads/${uniqueName}`,
        publicId: `mock_${uniqueName}`
      };
    }

    try {
      const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        folder: 'medleave_portal',
        resource_type: 'auto'
      });

      // Delete the local temporary file
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('Failed to clean up temp file:', err);
      }

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    } catch (error) {
      console.error('[FileStorageService] Cloudinary upload error:', error);
      throw new Error('File upload to storage provider failed.');
    }
  }
}
