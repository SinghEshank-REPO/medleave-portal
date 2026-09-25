const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\eshan\\.gemini\\antigravity\\brain\\4246aca7-8143-4e5b-bf08-81e553e68055';
const publicDir = path.join(__dirname, 'public');

try {
  fs.copyFileSync(path.join(brainDir, 'juit_logo_1790304112452.png'), path.join(publicDir, 'juit_logo.png'));
  console.log('Copied juit_logo.png');
} catch(e) { console.error(e); }

try {
  fs.copyFileSync(path.join(brainDir, 'juit_campus_1790304141284.png'), path.join(publicDir, 'juit_campus.png'));
  console.log('Copied juit_campus.png');
} catch(e) { console.error(e); }

try {
  fs.copyFileSync(path.join(brainDir, 'naac_badge_1790304174182.png'), path.join(publicDir, 'naac_badge.png'));
  console.log('Copied naac_badge.png');
} catch(e) { console.error(e); }
