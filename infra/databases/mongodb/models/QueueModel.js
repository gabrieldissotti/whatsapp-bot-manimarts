const schema = require('../schemas/QueueSchema');
const AppModel = require('./AppModel');

class QueueModel extends AppModel {
  constructor({ connection }) {
    super({
      model: 'Queue',
      connection,
      schema,
    });
  }
}

module.exports = QueueModel;
