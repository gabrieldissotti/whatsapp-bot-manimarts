const dayjs = require('dayjs');
const AppRepository = require('./AppRepository');

class QueueRepository extends AppRepository {
  constructor({ connection, model }) {
    super({
      connection,
      model,
    });
  }

  async getMessagesByTopic({ topic }) {
    const QueueModel = await this.getModel();

    const query = {
      resolved: false,
      topic,
    };

    const result = await QueueModel.find(query);
    if (!result?.length) {
      return null;
    }

    return result?.map((doc) => doc.toObject()) || [];
  }

  async getAllPendingMessagesQualifiedToBeSent() {
    const QueueModel = await this.getModel();

    const query = {
      resolved: false,
      topic: 'messaging',
      'message.send_message_as_from': { $lte: dayjs().format() },
    };

    const result = await QueueModel.find(query);
    if (!result?.length) {
      return null;
    }

    return result?.map((doc) => doc.toObject()) || [];
  }

  async createMessage({ topic, message }) {
    const QueueModel = await this.getModel();

    const result = await QueueModel.create({
      topic,
      message,
    });
    if (!result) {
      return null;
    }

    return result.toObject();
  }

  async resolveMessage({ messageID }) {
    const QueueModel = await this.getModel();

    const query = { _id: messageID };

    await QueueModel.updateOne(query, { $set: { resolved: true } });
  }
}

module.exports = QueueRepository;
