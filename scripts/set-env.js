// scripts/set-env.js
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // If you use a .env file for local development outside of App Hosting

const targetPathProd = path.join(__dirname, '../src/environments/environment.prod.ts');
const targetPathDev = path.join(__dirname, '../src/environments/environment.ts');

const googleMapsApiKey = process.env['google-maps-api-key']; // Matches apphosting.yaml variable
const googleMapsApiId = process.env['google-maps-map-id'];   // Matches apphosting.yaml variable
const datoCMSKey = process.env['dato-cms-key']; // Matches apphosting.yaml variable

if (!googleMapsApiKey) {
  console.warn(
    'Warning: google-maps-api-key is not defined in environment variables during build. ' + // Using actual variable name
    'Using a placeholder. This will likely fail for actual map loads.'
  );
}
if (!googleMapsApiId) { // Added warning for map ID
  console.warn(
    'Warning: google-maps-map-id is not defined in environment variables during build. ' +
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
  googleMapsApiId: "${googleMapsApiId || 'YOUR_FALLBACK_OR_EMPTY_ID_FOR_LOCAL_DEV'}"  // Corrected property name from googleMapsApiKey to googleMapsApiId,
  datoCMSKey: "${datoCMSKey || 'YOUR_FALLBACK_OR_EMPTY_KEY_FOR_LOCAL_DEV'}" // Added datoCMSKey
};
`;

fs.writeFileSync(targetPathProd, envConfigFileProd);

fs.writeFileSync(targetPathDev, envConfigFileDev);
