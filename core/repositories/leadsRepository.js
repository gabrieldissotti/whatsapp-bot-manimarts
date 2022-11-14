const LeadSchema = require('../../infra/databases/mongodb/schemas/LeadSchema');

class LeadsRepository {
  constructor({ connection }) {
    this.connection = connection;
  }

  async getLeadModel() {
    const db = await this.connection;
    const LeadModel = db.model('Lead', LeadSchema);

    return LeadModel;
  }

  async getLead(recipientPhoneNumber) {
    const LeadModel = await this.getLeadModel();

    const result = await LeadModel.findOne({
      phoneNumber: recipientPhoneNumber,
    });
    if (!result) {
      return null;
    }

    return result.toObject();
  }

  async createLead({ phoneNumber, name, stagePosition }) {
    const LeadModel = await this.getLeadModel();

    const result = await LeadModel.create({
      phoneNumber,
      name,
      stage_position: stagePosition,
    });
    if (!result) {
      return null;
    }

    return result.toObject();
  }

  async updateLead({ phoneNumber, stagePosition }) {
    const LeadModel = await this.getLeadModel();

    const query = { phoneNumber };
    const payload = {
      stage_position: stagePosition,
    };

    await LeadModel.updateOne(query, { $set: payload });
  }
}

module.exports = LeadsRepository;
