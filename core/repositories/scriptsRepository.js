const ScriptSchema = require('../../infra/databases/mongodb/schemas/ScriptSchema');

class ScriptsRepository {
  constructor({ connection }) {
    this.connection = connection;
  }

  async getScriptModel() {
    const db = await this.connection;
    const ScriptModel = db.model('Script', ScriptSchema);

    return ScriptModel;
  }

  async getStages() {
    const ScriptModel = await this.getScriptModel();

    const result = await ScriptModel.findOne();
    if (!result) {
      return null;
    }

    const { stages } = result.toObject();

    return stages;
  }
}

module.exports = ScriptsRepository;
