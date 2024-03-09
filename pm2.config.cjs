module.exports = {
  apps: [
    {
      name: 'SmartMeetingJoiner',
      script: 'main.js',
      cron_restart: '0 9 * * *',
      autorestart: true
    }
  ]
};