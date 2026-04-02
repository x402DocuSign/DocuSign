// Place at: C:\projects\esign-platform\ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'esign-api',
      script: 'apps/api/dist/index.js',
      cwd: 'C:\\projects\\esign-platform',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: 'logs/api-error.log',
      out_file: 'logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 4000,
      exp_backoff_restart_delay: 100,
    },
    {
      name: 'esign-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: 'C:\\projects\\esign-platform\\apps\\web',
      instances: 1,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: 'C:\\projects\\esign-platform\\logs\\web-error.log',
      out_file: 'C:\\projects\\esign-platform\\logs\\web-out.log',
    },
  ],
}