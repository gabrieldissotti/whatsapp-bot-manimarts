const WebhookController = require('../../core/controllers/WebhookController');
const LeadsRepository = require('../../core/repositories/LeadsRepository');
const ScriptsRepository = require('../../core/repositories/ScriptsRepository');
const LeadsService = require('../../core/services/LeadsService');
const AuthService = require('../../core/services/AuthService');
const WhatsAppBusinessCloudAPI = require('../apis/WhatsAppBusinessCloudAPI');
const mongoDbClient = require('../databases/mongodb/client');

const connection = mongoDbClient.getConnection();

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

module.exports = {
  webhookController: new WebhookController({ leadsService, authService }),
};
