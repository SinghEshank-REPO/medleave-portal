const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\eshan\\.gemini\\antigravity\\brain\\4246aca7-8143-4e5b-bf08-81e553e68055';
const publicDir = path.join(__dirname, 'public');

try {
  fs.copyFileSync(path.join(brainDir, 'media__1790306360622.jpg'), path.join(publicDir, 'medical_laptop_hero.jpg'));
  fs.copyFileSync(path.join(brainDir, 'media__1790306360622.jpg'), path.join(publicDir, 'hero_clipboard.png'));
  console.log('Successfully copied medical_laptop_hero.jpg to public!');
} catch (e) {
  console.error('Copy error:', e);
}
