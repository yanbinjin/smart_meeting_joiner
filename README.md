## Set up

### Step 1: Set up Google Calendar API

- Go to the Google Cloud Console (https://console.cloud.google.com/).
Create a new project or select an existing project.
- In the left sidebar, click on "APIs & Services" and then click on "Library".
- Search for "Google Calendar API" and click on it.
- Click on the "Enable" button to enable the Google Calendar API for your project.
- Go back to the "APIs & Services" page and click on "Credentials".
- Click on "Create Credentials" and select "OAuth client ID".
Choose the application type "Desktop app" and give it a name.
Click "Create" to create the OAuth client ID.
- On the "Credentials" page, download the client configuration file.
A JSON file named client_id.json (or similar) will be downloaded to your computer.
- Save this JSON file securely in your project directory.

### Step 2: Replace the clientId and clientSecret

Replace the clientId and clientSecret with the client_id and client_secret from the JSON file in the `./config.js` file.

### Step 3: Install dependencies
- Open your terminal, navigate to the directory of smart_meeting_joiner project

- Once you are inside the smart_meeting_joiner directory, run the following command to install the dependencies: `npm install`


### Step 4: Start the server
Then Run `node main.js` to start the server and it will set up today's meetings.

### Optional: Step 5: 
To set up a server running in the background and automatically restart it at a specific time each day (depending on your configuration), add the following line to the end of your .zsh file:

```
pm2 start -f /path/to/smart_meeting_joiner/pm2.config.cjs
```

This command will start the server using PM2, a process manager for Node.js applications. The server will be restarted automatically at the time specified in the `pm2.config.cjs` file. The current restart time is set to 9 am, which is configured using the cron_restart: '0 9 * * *' option in the configuration file.

Please note that the server will only be restarted if your laptop/desktop is running at the specified time. Additionally, with current setting, this command in .zsh file will be kill and restart the server whenever you open a new terminal tab.


TODO:
Listen on Google calendar to schedule new meetings after the server started