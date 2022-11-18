const AppRepository = require('./AppRepository');

class ScriptsRepository extends AppRepository {
  constructor({ connection, model }) {
    super({
      connection,
      model,
    });
  }

  async getStages() {
    const ScriptModel = await this.getModel();

    const result = await ScriptModel.findOne();
    if (!result) {
      return null;
    }

    const { stages } = result.toObject();

    return stages;
  }
}

module.exports = ScriptsRepository;
