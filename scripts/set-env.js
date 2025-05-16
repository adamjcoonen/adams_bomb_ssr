// scripts/set-env.js
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // If you use a .env file for local development outside of App Hosting

const targetPathProd = path.join(__dirname, '../src/environments/environment.prod.ts');
const targetPathDev = path.join(__dirname, '../src/environments/environment.ts');

const googleMapsApiKey = process.env['google-maps-api-key']; // This will be populated by App Hosting

if (!googleMapsApiKey) {
  console.warn(
    'Warning: Maps_API_KEY is not defined in environment variables. ' +
    'Using a placeholder. This will likely fail for actual map loads.'
  );
}

const envConfigFileProd = `
export const environment = {
  production: true,
  googleMapsApiKey: "${googleMapsApiKey || 'YOUR_FALLBACK_OR_EMPTY_KEY_FOR_LOCAL_DEV'}"
};
`;

const envConfigFileDev = `
export const environment = {
  production: false,
  googleMapsApiKey: "${googleMapsApiKey || 'YOUR_FALLBACK_OR_EMPTY_KEY_FOR_LOCAL_DEV'}"
};
`;

console.log('Writing Google Maps API Key to environment.prod.ts');
fs.writeFileSync(targetPathProd, envConfigFileProd);

console.log('Writing Google Maps API Key to environment.ts');
fs.writeFileSync(targetPathDev, envConfigFileDev);

console.log('Environment files updated successfully.');