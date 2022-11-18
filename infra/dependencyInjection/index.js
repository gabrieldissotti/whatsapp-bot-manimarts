/**
 * imports
 */
const WebhookController = require('../../core/controllers/WebhookController');
const LeadsController = require('../../core/controllers/LeadsController');
const LeadsRepository = require('../../core/repositories/LeadsRepository');
const ScriptsRepository = require('../../core/repositories/ScriptsRepository');
const QueueRepository = require('../../core/repositories/QueueRepository');
const LeadsService = require('../../core/services/LeadsService');
const AuthService = require('../../core/services/AuthService');
const WhatsAppBusinessCloudAPI = require('../apis/WhatsAppBusinessCloudAPI');
const mongoDbClient = require('../databases/mongodb/client');
const logger = require('../logger/pino');
const LeadModel = require('../databases/mongodb/models/LeadModel');
const ScriptModel = require('../databases/mongodb/models/ScriptModel');
const QueueModel = require('../databases/mongodb/models/QueueModel');

/**
 * instance connections
 */

const connection = mongoDbClient.getConnection();

/**
 * instance models
 */
const leadModel = new LeadModel({
  connection,
});
const queueModel = new QueueModel({
  connection,
});
const scriptModel = new ScriptModel({
  connection,
});

/**
 * instance repositories
 */
const leadsRepository = new LeadsRepository({ connection, model: leadModel });
const scriptsRepository = new ScriptsRepository({
  connection,
  model: scriptModel,
});
const queueRepository = new QueueRepository({ connection, model: queueModel });
const whatsAppBusinessCloudAPI = new WhatsAppBusinessCloudAPI();

/**
 * instance services
 */
const leadsService = new LeadsService({
  logger,
  leadsRepository,
  queueRepository,
  scriptsRepository,
  whatsAppBusinessCloudAPI,
});

const authService = new AuthService({
  leadsRepository,
  scriptsRepository,
});

/**
 * instance controllers
 */
module.exports = {
  webhookController: new WebhookController({
    leadsService,
    authService,
    logger,
  }),
  leadsController: new LeadsController({
    leadsService,
    authService,
    logger,
  }),
};
