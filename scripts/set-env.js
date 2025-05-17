// scripts/set-env.js
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // If you use a .env file for local development outside of App Hosting

const targetPathProd = path.join(__dirname, '../src/environments/environment.prod.ts');
const targetPathDev = path.join(__dirname, '../src/environments/environment.ts');

const googleMapsApiKey = process.env['google-maps-api-key']; // Matches apphosting.yaml variable
const googleMapsApiId = process.env['google-maps-api-id'];   // Matches apphosting.yaml variable

if (!googleMapsApiKey) {
  console.warn(
    'Warning: google-maps-api-key is not defined in environment variables during build. ' + // Using actual variable name
    'Using a placeholder. This will likely fail for actual map loads.'
  );
}
if (!googleMapsApiId) { // Added warning for map ID
  console.warn(
    'Warning: google-maps-api-id is not defined in environment variables during build. ' +
    'Using a placeholder.'
  );
}

const envConfigFileProd = `
export const environment = {
  production: true,
  googleMapsApiKey: "${googleMapsApiKey || 'YOUR_FALLBACK_OR_EMPTY_KEY_FOR_LOCAL_DEV'}",
  googleMapsApiId: "${googleMapsApiId || 'YOUR_FALLBACK_OR_EMPTY_ID_FOR_LOCAL_DEV'}" // Corrected property name from googleMapsApiKey to googleMapsApiId
};
`;

const envConfigFileDev = `
export const environment = {
  production: false,
  googleMapsApiKey: "${googleMapsApiKey || 'YOUR_FALLBACK_OR_EMPTY_KEY_FOR_LOCAL_DEV'}", // Added comma
  googleMapsApiId: "${googleMapsApiId || 'YOUR_FALLBACK_OR_EMPTY_ID_FOR_LOCAL_DEV'}"  // Corrected property name from googleMapsApiKey to googleMapsApiId
};
`;

console.log('Writing environment config to environment.prod.ts');
fs.writeFileSync(targetPathProd, envConfigFileProd);

console.log('Writing environment config to environment.ts');
fs.writeFileSync(targetPathDev, envConfigFileDev);

console.log('Environment files updated successfully.');