var winston = require('winston'); //(1)

function logProvider() { //(2)
  return winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
  });
}

var PROXY_CONF = {
    '/local': {
      target: 'http://localhost:8080',
      secure: false,
      changeOrigin: true,
      logLevel: 'debug',
      logProvider: logProvider, // (3)
      cookiePathRewrite: '/local/',
      pathRewrite: {
        '/local': '/carm-services-web/services',
      },
    },
  };
  
  module.exports = PROXY_CONF;