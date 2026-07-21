const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8787);
const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(body));
}

function requestOddsApi(pathname, params) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.THE_ODDS_API_KEY;

    if (!apiKey) {
      reject(new Error('Missing THE_ODDS_API_KEY in .env'));
      return;
    }

    params.set('apiKey', apiKey);
    const url = `${ODDS_API_BASE_URL}${pathname}?${params.toString()}`;

    https
      .get(url, (apiResponse) => {
        let data = '';

        apiResponse.on('data', (chunk) => {
          data += chunk;
        });

        apiResponse.on('end', () => {
          try {
            const parsed = JSON.parse(data);

            if (apiResponse.statusCode >= 400) {
              reject(new Error(parsed.message || parsed.error || 'The Odds API request failed'));
              return;
            }

            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });
}

function getSport(requestUrl) {
  const sport = requestUrl.searchParams.get('sport');

  if (!sport) {
    throw new Error('Missing sport query parameter');
  }

  return sport;
}

loadEnvFile();

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'OPTIONS') {
    sendJson(response, 200, {});
    return;
  }

  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    if (requestUrl.pathname === '/health') {
      sendJson(response, 200, { ok: true, hasApiKey: Boolean(process.env.THE_ODDS_API_KEY) });
      return;
    }

    if (requestUrl.pathname === '/api/sports') {
      const data = await requestOddsApi('/sports', new URLSearchParams());
      sendJson(response, 200, data);
      return;
    }

    if (requestUrl.pathname === '/api/scores') {
      const sport = getSport(requestUrl);
      const params = new URLSearchParams({ daysFrom: '1' });
      const data = await requestOddsApi(`/sports/${sport}/scores`, params);
      sendJson(response, 200, data);
      return;
    }

    if (requestUrl.pathname === '/api/odds') {
      const sport = getSport(requestUrl);
      const params = new URLSearchParams({
        regions: 'us',
        markets: 'h2h,spreads,totals',
        oddsFormat: 'american',
      });
      const data = await requestOddsApi(`/sports/${sport}/odds`, params);
      sendJson(response, 200, data);
      return;
    }

    sendJson(response, 404, { error: 'Route not found' });
  } catch (error) {
    sendJson(response, 500, { error: error.message || 'Proxy server error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Tailgate odds proxy running at http://localhost:${PORT}`);
});
