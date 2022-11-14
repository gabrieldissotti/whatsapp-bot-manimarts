const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebhookController = require('./controllers/WebhookController');
const LeadsRepository = require('./repositories/LeadsRepository');
const ScriptsRepository = require('./repositories/ScriptsRepository');
const LeadsService = require('./services/LeadsService');
const AuthService = require('./services/AuthService');
const WhatsAppBusinessCloudAPI = require('../infra/apis/WhatsAppBusinessCloudAPI');

const mongoDbClient = require('../infra/databases/mongodb/client');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const connection = await mongoDbClient.getConnection();

  const leadsRepository = new LeadsRepository({ connection });
  const scriptsRepository = new ScriptsRepository({ connection });
  const whatsAppBusinessCloudAPI = new WhatsAppBusinessCloudAPI();

  const leadsService = new LeadsService({
    leadsRepository,
    scriptsRepository,
    whatsAppBusinessCloudAPI,
  });

  const authService = new AuthService({
    leadsRepository,
    scriptsRepository,
  });

  createServer(async (req, res) => {
    try {
      req.controllers = {
        webhookController: new WebhookController({ leadsService, authService }),
      };

      const parsedUrl = parse(req.url, true);

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;

    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
