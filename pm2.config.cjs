module.exports = {
  apps: [
    {
      name: 'SmartMeetingJoiner',
      script: 'main.js',
      cron_restart: '30 10 * * *',
      autorestart: true
    }
  ]
};