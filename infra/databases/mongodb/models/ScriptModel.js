const schema = require('../schemas/ScriptSchema');
const AppModel = require('./AppModel');

class ScriptModel extends AppModel {
  constructor({ connection }) {
    super({
      model: 'Script',
      connection,
      schema,
    });
  }
}

module.exports = ScriptModel;
