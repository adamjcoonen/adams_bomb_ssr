import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import path from 'path';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import axios from 'axios';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import * as xml2js from 'xml2js';

// REMOVE: const googleApiKey = process.env['Maps_API_KEY']; // This line is unused and can be removed

console.log('--- SERVER.TS WAS CHANGED AND RESTARTED --- ' + new Date().toISOString());
// Load environment variables from .env file in development
if (process.env['NODE_ENV'] !== 'production') {
 const result = dotenv.config();
 if (result.error) {
  console.warn(`Note: .env file not found or error loading it: ${result.error?.message}. Falling back to other environment variables or services.`);
 }
}

const PORT = process.env['PORT'] || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/browser');
const __dirname = dirname(fileURLToPath(import.meta.url));
const BROWSER_PATH = join(__dirname, '../browser');

// Initialize all caches as distinct variables
let cachedDatoCmsToken: string | undefined = undefined;
let cachedGoogleMapsApiKey: string | undefined = undefined;
let cachedGoogleMapsMapId: string | undefined = undefined;

/**
* Retrieves a secret from Google Cloud Secret Manager.
* @param secretName The name of the secret.
* @returns The secret value, or undefined on error.
*/
async function fetchSecretByName(secretName: string): Promise<string | undefined> {
 console.log(`Attempting to fetch secret: ${secretName}`);
 try {
  const auth = new google.auth.GoogleAuth({
   scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const projectId = await auth.getProjectId();
  const secretManager = google.secretmanager({ auth: auth, version: 'v1' });
  const res = await secretManager.projects.secrets.versions.access({
   name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });

  // CRITICAL FIX: Ensure to .trim() any whitespace/newlines
  const value = Buffer.from(res.data.payload?.data?.toString() as string, 'base64').toString('utf8').trim(); // <<< ADDED .trim() HERE
  console.log(`Successfully fetched secret: ${secretName}`);
  return value; // Return the secret value
 } catch (error) {
  console.error(`Error fetching secret '${secretName}':`, error);
  // Do NOT re-throw here if you want graceful fallback in get... functions
  return undefined; // Return undefined instead of throwing
 }
}

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

app.use(express.json());

// Helper to get the DatoCMS token
async function getDatoCmsToken(): Promise<string | undefined> {
 // 1. Try local environment variable first (from .env or Cloud Run env var)
 if (process.env['DATO_CMS_TOKEN']) { // Use DATO_CMS_TOKEN for consistency
  console.log('Using DatoCMS token from DATO_CMS_TOKEN environment variable.');
  return process.env['DATO_CMS_TOKEN'];
 }

 if (cachedDatoCmsToken) {
  console.log('Using cached DatoCMS token from in-memory cache.');
  return cachedDatoCmsToken;
 }

 // 2. Fallback to Google Secret Manager
 console.log('DatoCMS token not found in environment, attempting to fetch from Google Secret Manager.');
 try {
  const token = await fetchSecretByName('DATO_CMS_TOKEN'); // Secret name
  if (token) {
   cachedDatoCmsToken = token; // Assign to correct cache
  }
  return token;
 } catch (error) {
  console.error('Failed to retrieve DatoCMS token from any source.');
  throw error; // Re-throw for route to handle
 }
}

// Helper to get the Google Maps API Key
async function getGoogleMapsApiKey(): Promise<string | undefined> {
 // 1. Try local environment variable first (from .env or Cloud Run env var)
 if (process.env['Maps_API_KEY']) { // Use Maps_API_KEY for consistency
  console.log('Using Google Maps API key from environment variable.');
  return process.env['Maps_API_KEY'];
 }

 if (cachedGoogleMapsApiKey) {
  console.log('Using cached Google Maps API key from in-memory cache.');
  return cachedGoogleMapsApiKey;
 }

 // 2. Fallback to Google Secret Manager
 console.log('Google Maps API key not found in environment, attempting to fetch from Google Secret Manager.');
 try {
  const key = await fetchSecretByName('google-maps-api-key'); // Secret name
  if (key) {
   cachedGoogleMapsApiKey = key; // Assign to correct cache
  }
  return key;
 } catch (error) {
  console.error('Failed to retrieve Google Maps API key from any source.');
  return undefined; // Let endpoint handle
 }
}

// Corrected function for Google Maps Map ID
async function getGoogleMapsMapId(): Promise<string | undefined> {
 // 1. Try local environment variable first (from .env or Cloud Run env var)
 if (process.env['googleMapsMapId']) { // Use Maps_MAP_ID for consistency
  console.log('Using Google Maps Map ID from environment variable.');
  return process.env['googleMapsMapId'];
 }

 if (cachedGoogleMapsMapId) { // <<< CORRECTED: Use cachedGoogleMapsMapId
  console.log('Using cached Google Maps Map ID from in-memory cache.');
  return cachedGoogleMapsMapId; // <<< CORRECTED: Return cachedGoogleMapsMapId
 }

 // 2. Fallback to Google Secret Manager
 console.log('Google Maps Map ID not found in environment, attempting to fetch from Google Secret Manager.');
 try {
  const id = await fetchSecretByName('google-maps-map-id'); // Secret name
  if (id) {
   cachedGoogleMapsMapId = id; // <<< CORRECTED: Assign to cachedGoogleMapsMapId
  }
  return id;
 } catch (error) {
  console.error('Failed to retrieve Google Maps Map ID from any source.');
  return undefined; // Let endpoint handle
 }
}

const datoCmsResponseCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// --- API Endpoints MUST COME BEFORE STATIC FILE SERVING AND SSR CATCH-ALL ---
app.post('/api/datocms/', async (req: any, res: any) => {
 let datoCmsToken: string | undefined;
 try {
  datoCmsToken = await getDatoCmsToken();
  if (!datoCmsToken) {
   return res.status(500).json({ error: 'Failed to obtain DatoCMS token.' });
  }
 } catch (error) {
  return res.status(500).json({ error: 'Internal server error during token retrieval.' });
 }

 const query = req.body.query;
 if (!query) {
  return res.status(400).json({ error: 'GraphQL query is required in the request body.' });
 }

 const cacheKey = JSON.stringify(query);
 const cachedData = datoCmsResponseCache.get(cacheKey);
 if (cachedData) {
  const cacheDataTyped = cachedData as { data: any; headers?: Record<string, string> };
  console.log('Serving DatoCMS data from in-memory response cache.');
  if (cacheDataTyped.headers && cacheDataTyped.headers['x-cache-tags']) {
   res.setHeader('X-DatoCMS-Cache-Tags', cacheDataTyped.headers['x-cache-tags']);
  }
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
  return res.status(200).json(cacheDataTyped.data);
 }

 const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${datoCmsToken}`,
 };

 try {
  const response = await axios.post('https://graphql.datocms.com/', { query }, { headers });
  datoCmsResponseCache.set(cacheKey, { data: response.data, headers: response.headers });
  res.status(response.status).json(response.data);
 } catch (error: any) {
  console.error('Error fetching data from DatoCMS:', error.message);
  if (error.response) {
   console.error('DatoCMS response error:', error.response.status);
   res.status(error.response.status || 500).json({
    error: 'Failed to fetch data from DatoCMS.',
    details: error.message
   });
  } else {
   res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
 }
});

  // Corrected: API route for fetching and parsing the RSS feed
  app.get('/api/podcast-episodes', async (req, res) => {
    const RSS_FEED_URL = 'https://media.rss.com/laughing-historically/feed.xml'; // Your actual RSS.com feed URL

    try {
      const response = await axios.get(RSS_FEED_URL);
      const xml = response.data;

      const parser = new xml2js.Parser({ explicitArray: false });

      // Wrap the callback-based parseString in a Promise
      const episodes = await new Promise((resolve, reject) => {
        parser.parseString(xml, (err, result) => {
          if (err) {
            console.error('Error parsing RSS feed XML:', err);
            return reject(new Error('Failed to parse RSS feed')); // Reject the promise on error
          }

          // Ensure result.rss.channel.item is an array, even if it's a single item
          const items = Array.isArray(result.rss.channel.item) ? result.rss.channel.item : [result.rss.channel.item];

          const parsedEpisodes = items.map((item: any) => ({
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
            guid: item.guid,
            audioUrl: item.enclosure?.$?.url, // Access the URL attribute from <enclosure>
            audioType: item.enclosure?.$?.type,
            audioLength: item.enclosure?.$?.length ? parseInt(item.enclosure.$.length, 10) : undefined,
            imageUrl: item['itunes:image']?.$?.href // Access the href attribute from <itunes:image>
          }));
          resolve(parsedEpisodes); // Resolve the promise with the parsed data
        });
      });

      res.json(episodes); // Send the JSON response after parsing completes
    } catch (error: any) { // Explicitly cast error to 'any' for simpler handling
      console.error('Error fetching or parsing RSS feed:', error);
      // Differentiate between network/axios error and XML parsing error
      const userMessage = error.message === 'Failed to parse RSS feed'
                          ? 'Failed to parse podcast feed data.'
                          : 'Failed to fetch podcast episodes due to a network error.';
      res.status(500).json({ error: userMessage });
    }
  });

// REMOVED: app.get('/api/google-maps-api-key', ...) as it's now redundant

// --- Serve static files from /browser ---
// This MUST come AFTER all your specific API routes
app.get(
 '**',
 express.static(browserDistFolder, {
  maxAge: '1y',
  index: 'index.html' // Important for client-side routing fallback for static assets
 }),
);

/**
* Handle all other requests by rendering the Angular application.
* This MUST come LAST, after all API and static file routes.
*/
app.get('**', (req, res, next) => {
 const { protocol, originalUrl, baseUrl, headers } = req;

 commonEngine
  .render({
   bootstrap,
   documentFilePath: indexHtml,
   url: `${protocol}://${headers.host}${originalUrl}`,
   publicPath: browserDistFolder,
   providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
  })
  .then((html) => {
   res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600');
   res.send(html);
  })
 .catch((err) => next(err));
});

/**
* Start the server if this module is the main entry point.
*/
if (isMainModule(import.meta.url)) {
 const port = process.env['PORT'] || 4000;
 app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
 });
}

export default app;