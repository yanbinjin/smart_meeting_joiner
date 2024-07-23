import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import url from 'url';
import { exec } from 'child_process';
import fs from 'fs/promises';
    
import config from './config.js';

const clientId = config.clientId;
const clientSecret = config.clientSecret;
const redirectUri = config.redirectUri;

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);


async function getStoredToken() {
  try {
    const token = await fs.readFile('token.json');
    return JSON.parse(token);
  } catch (err) {
    return null;
  }
}

async function storeToken(token) {
  await fs.writeFile('token.json', JSON.stringify(token));
}

async function handleOAuth2Callback(req, res) {
  const qs = new url.URL(req.url, 'http://localhost:3100').searchParams;
  const code = qs.get('code');
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  await storeToken(tokens);

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Authentication successful! You can now close this window.');

  await retrieveAndProcessEvents();
}

async function retrieveAndProcessEvents() {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    calendar.events.list({
      calendarId: 'primary',
      timeMin: today.toISOString(),
      timeMax: tomorrow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) {
        console.error('Error retrieving events:', err);
        server.close();
        return;
      }
      const events = res.data.items;
      const totalMeetings = events.length;
      let openedMeetings = 0;
      let scheduledMeeting = 0;

      events.forEach(event => {
        const startTime = new Date(event.start.dateTime);
        const timeUntilMeeting = startTime - new Date();
        const cd = event.conferenceData;
        const meetingUrl = cd ? cd.entryPoints[0].uri : extractZoomUrl(event.description);
        if (timeUntilMeeting > 0 && meetingUrl) {
          scheduleMeeting(startTime, timeUntilMeeting, meetingUrl, openedMeetings, totalMeetings, event);
          scheduledMeeting++;
        }
        openedMeetings++
      });

      if (scheduledMeeting === 0 ) {
        console.log('\x1b[32m\x1b[1m');
        console.log('╔═════════════════════════════════════════════════╗');
        console.log('║                                                 ║');
        console.log('║     There is no upcoming meeting today!         ║');
        console.log('║                                                 ║');
        console.log('╚═════════════════════════════════════════════════╝');
        console.log('\x1b[0m');
      } else {
        console.log(`scheduled ${scheduledMeeting} meeetings`)
      }
    });
}

function scheduleMeeting(startTime, timeUntilMeeting, meetingUrl, openedMeetings, totalMeetings, event) {
  setTimeout(() => {
    exec(`open "${meetingUrl}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error opening Zoom: ${error.message}`);
        return;
      }
      openedMeetings++;
      console.log(`${event.summary} meeting joined successfully`);
      if (openedMeetings === totalMeetings && process.env.ALLOW_EXIT === 'true') {
            console.log('\x1b[32m\x1b[1m');
            console.log('╔═════════════════════════════════════════════════╗');
            console.log('║                                                 ║');
            console.log('║     There is no more meeting today!             ║');
            console.log('║                                                 ║');
            console.log('╚═════════════════════════════════════════════════╝');
            console.log('\x1b[0m');
            server.close();
      }
    });
  }, timeUntilMeeting);
  console.log(`Scheduled meeting ${event.summary} at ${startTime}`)
}

function extractZoomUrl(description) {
  if (description === undefined) {
    return null
  }
  const regex = /https:\/\/[\w.-]+\.zoom\.us\/j\/\d+/;
  const match = description.match(regex);
  return match ? match[0] : null;
}

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/oauth2callback')) {
    await handleOAuth2Callback(req, res);
  }
});

server.listen(3009, async () => {
  console.log('Server is running on http://localhost:3009');

  const storedToken = await getStoredToken();
  if (storedToken) {
    oauth2Client.setCredentials(storedToken);
    await retrieveAndProcessEvents();
  } else {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
    const open = await import('open');
    open.default(authUrl);
  }
});

