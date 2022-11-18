const schema = require('../schemas/LeadSchema');
const AppModel = require('./AppModel');

class LeadModel extends AppModel {
  constructor({ connection }) {
    super({
      model: 'Lead',
      connection,
      schema,
    });
  }
}

module.exports = LeadModel;
