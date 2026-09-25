const fs = require('fs');
const path = require('path');

const sourcePath = 'C:\\Users\\eshan\\.gemini\\antigravity\\brain\\4246aca7-8143-4e5b-bf08-81e553e68055\\media__1790306360622.jpg';
const publicDir = path.resolve(__dirname, '../../public');

if (fs.existsSync(sourcePath)) {
  try {
    const buffer = fs.readFileSync(sourcePath);
    fs.writeFileSync(path.join(publicDir, 'medical_laptop_hero.jpg'), buffer);
    fs.writeFileSync(path.join(publicDir, 'hero_clipboard.png'), buffer);
    console.log('[sync_images] Successfully synced medical_laptop_hero.jpg to public!');
  } catch (err) {
    console.error('[sync_images] Error syncing image:', err);
  }
}
