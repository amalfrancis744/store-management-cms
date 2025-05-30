const fs = require('fs');
const path = require('path');

const envVariables = {
  '%%NEXT_PUBLIC_FIREBASE_API_KEY%%': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  '%%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%%': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  '%%NEXT_PUBLIC_FIREBASE_PROJECT_ID%%': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  '%%NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET%%': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  '%%NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID%%': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  '%%NEXT_PUBLIC_FIREBASE_APP_ID%%': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  '%%NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID%%': process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const swPath = path.join(process.cwd(), 'public', 'firebase-messaging-sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

for (const [placeholder, value] of Object.entries(envVariables)) {
  if (!value) {
    console.error(`Missing environment variable for ${placeholder}`);
    process.exit(1);
  }
  swContent = swContent.replace(new RegExp(placeholder, 'g'), value);
}

fs.writeFileSync(swPath, swContent);
console.log('Service worker environment variables injected successfully');