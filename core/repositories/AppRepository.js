class AppRepository {
  constructor({ connection, model }) {
    this.connection = connection;
    this.model = model;
  }

  async getModel() {
    await this.connection;

    return this.model.getModel();
  }
}

module.exports = AppRepository;
