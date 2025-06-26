import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import path from 'path';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import axios from 'axios';
// import { SecretManagerServiceClient} from '@google-cloud/secret-manager';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';

const googleApiKey = process.env['GOOGLE_MAPS_API_KEY'];

console.log('--- SERVER.TS WAS CHANGED AND RESTARTED --- ' + new Date().toISOString());
// Load environment variables from .env file in development
if (process.env['NODE_ENV'] !== 'production') {
  const result = dotenv.config();
  if (result.error) {
    // It's okay if .env doesn't exist, but you might want to log it for debugging
    console.warn(`Note: .env file not found or error loading it: ${result.error?.message}. Falling back to other environment variables or services.`);
  }
}

const PORT = process.env['PORT'] || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/browser');
// Use fileURLToPath to get __dirname in ES module context:
const __dirname = dirname(fileURLToPath(import.meta.url));
const BROWSER_PATH = join(__dirname, '../browser');
let cachedDatoCmsToken: string | undefined = undefined;
let cachedGoogleMapsApiKey: string | undefined = undefined;


/**
 * Retrieves a secret from Google Cloud Secret Manager.
 * @param secretName The name of the secret.
 * @param version The version of the secret to retrieve (e.g., 'latest', '1', 'dev', 'prod').
 * @returns The secret value, or null on error.
 */
async function fetchSecretByName(secretName: string): Promise<string | undefined> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'], // Add the correct scope
    });

    // obtain the current project Id
    const projectId = await auth.getProjectId();

    // build secret manager client
    const secretManager = google.secretmanager({ auth: auth, version: 'v1' });
    // console.log('Project ID:', projectId); // Log the project ID for debugging
    // console.log('Secret Name:', secretName); // Log the secret name for debugging
    // fetch the secret value
    const res = await secretManager.projects.secrets.versions.access({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`, // Use projectId
    });

    const token = Buffer.from(res.data.payload?.data?.toString() as string, 'base64').toString('utf8');
    cachedDatoCmsToken = token
    return token; // Return the secret value
  } catch (error) {
    console.error('Error fetching secret:', error);
    throw error; // Re-throw the error to be caught by the caller
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
  // 1. Try local environment variable first (from .env)
  if (process.env['DATO_CMS_TOKEN']) {
    console.log('Using local DatoCMS token from DATO_CMS_TOKEN_LOCAL environment variable.');
    return process.env['DATO_CMS_TOKEN'];
  }

  if (cachedDatoCmsToken) {
    console.log('Using cached DatoCMS token from in-memory cache.');
    return cachedDatoCmsToken;
  }


  // 2. Fallback to Google Secret Manager (for production or if local isn't set)
  console.log('Local DatoCMS token not found, attempting to fetch from Google Secret Manager.');
  try {
    return await fetchSecretByName('DATO_CMS_TOKEN');
  } catch (error) {
    // Error is already logged by fetchSecretByName
    console.error('Failed to retrieve DatoCMS token from any source.');
    throw error; // Re-throw to be handled by the route
  }
}

// NEW Helper to get the Google Maps API Key
async function getGoogleMapsApiKey(): Promise<string | undefined> {
  // 1. Try local environment variable first (from .env or Cloud Run env var)
  if (process.env['googleMapsApiKey']) {
    console.log('Using Google Maps API key from environment variable.');
    return process.env['googleMapsApiKey'];
  }

  if (cachedGoogleMapsApiKey) {
    console.log('Using cached Google Maps API key from in-memory cache.');
    return cachedGoogleMapsApiKey;
  }

  // 2. Fallback to Google Secret Manager (for production if env var not set directly)
  console.log('Google Maps API key not found in environment, attempting to fetch from Google Secret Manager.');
  try {
    const key = await fetchSecretByName('google-maps-api-key');
    if (key) {
      cachedGoogleMapsApiKey = key;
    }
    return key;
  } catch (error) {
    console.error('Failed to retrieve Google Maps API key from any source.');
    // Do NOT re-throw here if you want the API endpoint to still serve
    // an error rather than crash the server initialization.
    return undefined; // Let the /api/google-maps-api-key endpoint handle the error
  }
}

const datoCmsResponseCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // Cache for 5 minutes (300 seconds)


app.post('/api/datocms/', async (req: any, res: any) => {
  let datoCmsToken: string | undefined;
  try {
    datoCmsToken = await getDatoCmsToken();
    if (!datoCmsToken) {
      // console.error('DatoCMS token is undefined after attempting to fetch it.');
      return res.status(500).json({ error: 'Failed to obtain DatoCMS token.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during token retrieval.' });
  }

  const query = req.body.query;
  if (!query) {
    return res.status(400).json({ error: 'GraphQL query is required in the request body.' });
  }

    const cacheKey = JSON.stringify(query); // Use the query as a cache key
  
    // Try to get from in-memory cache first
    const cachedData = datoCmsResponseCache.get(cacheKey);
    if (cachedData) {
      const cacheDataTyped = cachedData as { data: any; headers?: Record<string, string> };
      console.log('Serving DatoCMS data from in-memory response cache.');
      // Re-add X-DatoCMS-Cache-Tags if they were part of the cached response for CDN
      if (cacheDataTyped.headers && cacheDataTyped.headers['x-cache-tags']) {
        res.setHeader('X-DatoCMS-Cache-Tags', cacheDataTyped.headers['x-cache-tags']);
      }
      // Set Cache-Control for CDN and browser (even for cached responses)
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300'); // Example: 1 min browser, 5 min CDN
      return res.status(200).json(cacheDataTyped.data);
    }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${datoCmsToken}`,
  };

  try {
    const response = await axios.post('https://graphql.datocms.com/', { query }, { headers });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error fetching data from DatoCMS:', error.message);
    if (error.response) {
      console.error('DatoCMS response error:', error.response.status, error.response.data);
      res.status(error.response.status || 500).json({
        error: 'Failed to fetch data from DatoCMS.',
        details: error.response.data || error.message
      });
    } else {
      res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
  }
  return res; // Not needed here, res.json() or res.status().json() sends the response.
});

// NEW API endpoint to serve the Google Maps API Key
app.get('/api/google-maps-api-key', async (req, res) => {
  try {
    const apiKey = await getGoogleMapsApiKey();
    if (apiKey) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.status(200).json({ apiKey: apiKey });
    } else {
      console.error('Google Maps API key could not be retrieved.');
      res.status(500).json({ error: 'Google Maps API key not available.' });
    }
  } catch (error) {
    console.error('Error in /api/google-maps-api-key endpoint:', error);
    res.status(500).json({ error: 'Internal server error during Google Maps API key retrieval.' });
  }
});

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
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
      // Set Cache-Control headers for CDN and browser caching
      // Adjust max-age and s-maxage based on content dynamism.
      // For a comedy show website, main pages might not change very frequently.
      // Example: Cache for 10 minutes in browser, 1 hour at CDN.
      res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600'); [5, 6]
      res.send(html);
    })
   .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}


export default app;
