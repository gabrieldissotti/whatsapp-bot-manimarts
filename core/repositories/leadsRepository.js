const AppRepository = require('./AppRepository');

class LeadsRepository extends AppRepository {
  constructor({ connection, model }) {
    super({
      connection,
      model,
    });
  }

  async getLead(recipientPhoneNumber) {
    const LeadModel = await this.getModel();

    const result = await LeadModel.findOne({
      phoneNumber: recipientPhoneNumber,
    });
    if (!result) {
      return null;
    }

    return result.toObject();
  }

  async createLead({ phoneNumber, name, stagePosition }) {
    const LeadModel = await this.getModel();

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

  async updateLead({
    phoneNumber,
    stagePosition,
    isLockedInThisStage,
    receivedSomeImageSoFar,
  }) {
    const LeadModel = await this.getModel();

    const query = { phoneNumber };
    const $set = {};

    function isDefined(a) {
      return typeof a !== 'undefined';
    }

    if (isDefined(stagePosition)) $set.stage_position = stagePosition;

    if (isDefined(isLockedInThisStage))
      $set.locked_in_this_stage = isLockedInThisStage;

    if (isDefined(receivedSomeImageSoFar))
      $set.received_some_image_so_far = receivedSomeImageSoFar;

    await LeadModel.updateOne(query, { $set });
  }

  async lockLead({ phoneNumber }) {
    const LeadModel = await this.getModel();

    const query = { phoneNumber };
    const $set = {
      locked_in_this_stage: true,
    };

    await LeadModel.updateOne(query, { $set });
  }

  async unlockLead({ phoneNumber }) {
    const LeadModel = await this.getModel();

    const query = { phoneNumber };
    const $set = {
      locked_in_this_stage: false,
    };

    await LeadModel.updateOne(query, { $set });
  }
}

module.exports = LeadsRepository;
