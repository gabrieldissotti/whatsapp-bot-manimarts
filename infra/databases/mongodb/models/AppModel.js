const mongoose = require('mongoose');

class AppModel {
  constructor({ connection, model, schema }) {
    this.connection = connection;
    this.model = model;
    this.schema = schema;
  }

  async getModel() {
    await this.connection;

    const db = await this.connection;
    const model =
      mongoose.models[this.model] || db.model(this.model, this.schema);

    return model;
  }
}

module.exports = AppModel;
