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

    return Buffer.from(res.data.payload?.data?.toString() as string, 'base64').toString('utf8');
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

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

// Helper to get the DatoCMS token
async function getDatoCmsToken(): Promise<string | undefined> {
  // 1. Try local environment variable first (from .env)
  if (process.env['DATO_CMS_TOKEN_LOCAL']) {
    // console.log('Using local DatoCMS token from DATO_CMS_TOKEN_LOCAL environment variable.');
    return process.env['DATO_CMS_TOKEN_LOCAL'];
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

app.post('/api/datocms/', async (req, res) => {
  let datoCmsToken: string | undefined;
  try {
    datoCmsToken = await getDatoCmsToken();
    if (!datoCmsToken) {
      console.error('DatoCMS token is undefined after attempting to fetch it.');
      return res.status(500).json({ error: 'Failed to obtain DatoCMS token.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during token retrieval.' });
  }

  const query = req.body.query;
  if (!query) {
    return res.status(400).json({ error: 'GraphQL query is required in the request body.' });
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${datoCmsToken}`,
  };

  try {
    const response = await axios.post('https://graphql.datocms.com/', { query }, { headers });
    // console.log('DatoCMS Response:', response.data) // Keep for debugging if needed
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

app.get(
  '**',
  express.static(browserDistFolder, { // Serve static files from the browser distribution
    maxAge: '1y',
    index: 'index.html' // This is important, but Angular rendering will take precedence for routes
  }),
);


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
    .then((html) => res.send(html))
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
