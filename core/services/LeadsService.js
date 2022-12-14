const dayjs = require('dayjs');

const { MESSAGE_TO_START_SCRIPT } = require('../constants/scripts');

class LeadsService {
  constructor({
    logger,
    leadsRepository,
    queueRepository,
    scriptsRepository,
    whatsAppBusinessCloudAPI,
  }) {
    this.logger = logger;
    this.leadsRepository = leadsRepository;
    this.queueRepository = queueRepository;
    this.scriptsRepository = scriptsRepository;
    this.whatsAppBusinessCloudAPI = whatsAppBusinessCloudAPI;
  }

  async replyLead({ recipientPhoneNumber, messagesGiven }) {
    if (!recipientPhoneNumber)
      throw new Error('phone number is not present in webhook payload');

    const logger = this.logger.child({ phone: recipientPhoneNumber });

    try {
      let lead = await this.leadsRepository.getLead(recipientPhoneNumber);
      let isFirstContact = false;
      if (lead) {
        logger.info('lead found');
      } else {
        logger.info('lead not found');
        isFirstContact = true;

        if (messagesGiven[0]?.text?.body !== MESSAGE_TO_START_SCRIPT) {
          logger.info('lead not qualified to start bot script, skipping');
          return;
        }

        lead = this.leadsRepository.createLead({
          phoneNumber: recipientPhoneNumber,
          name: 'Unnamed yet',
          stagePosition: 0,
        });
        logger.info('created new lead');
      }

      logger.info('getting stages from database');
      const scriptStages = await this.scriptsRepository.getStages();
      if (!scriptStages) {
        throw new Error('no script found in database to get stages');
      }
      logger
        .child({ totalStages: scriptStages.length })
        .info('script stages found');

      const messageIsAnImage = messagesGiven[0]?.type === 'image';

      if (lead.locked_in_this_stage) {
        if (!lead.received_some_image_so_far && messageIsAnImage) {
          logger.info(
            'first image given from lead, saving this in lead document'
          );
          await this.leadsRepository.updateLead({
            phoneNumber: recipientPhoneNumber,
            receivedSomeImageSoFar:
              lead.received_some_image_so_far || messageIsAnImage,
          });
        }

        logger.info('lead locked in this stage, skipping');
        return;
      }

      let nextStage = scriptStages[0];
      if (!isFirstContact) {
        nextStage = scriptStages.find(
          (stage) => stage.position === lead.stage_position + 1
        );

        if (!nextStage) {
          logger.info('Script ends, skipping message webhook');
          return;
        }
      }
      logger
        .child({ nextStage: nextStage.position })
        .info('selected actual stage');

      if (nextStage?.rules?.should_wait_seconds_to_reply) {
        logger.info('next stage have a rule to wait some time before send');

        const secondsToWait = nextStage?.rules?.should_wait_seconds_to_reply;

        const sendMessageAsFrom = dayjs().add(secondsToWait, 'second').format();

        await this.leadsRepository.lockLead({
          phoneNumber: recipientPhoneNumber,
          until: sendMessageAsFrom,
        });
        await this.queueRepository.createMessage({
          topic: 'messaging',
          message: {
            lead_phone_number: recipientPhoneNumber,
            next_stage_id: nextStage._id, // eslint-disable-line no-underscore-dangle
            next_stage_waiting_time:
              nextStage.rules.should_wait_seconds_to_reply,
            send_message_as_from: sendMessageAsFrom,
            description: 'message waiting to be sent to lead whastapp',
          },
        });
        logger.info(
          'added message in queue to be sent to lead after waiting time is completed'
        );
      } else {
        const message = this.getMessageFromStage({
          lead,
          stage: nextStage,
          logger,
        });
        await this.sendMessage({ message, logger, recipientPhoneNumber });
        logger.info('lead replied successfully');
      }

      logger.info('updating actual lead stage in database');
      await this.leadsRepository.updateLead({
        phoneNumber: recipientPhoneNumber,
        stagePosition: nextStage.position,
        receivedSomeImageSoFar:
          lead.received_some_image_so_far || messageIsAnImage,
      });
      logger.info('lead stage updated successfully');
    } catch (error) {
      logger.child({ error }).error('error on reply lead');

      throw new Error(`failed to reply lead in service: ${error.message}`);
    }
  }

  async sendQueuedMessages({ requestID }) {
    const logger = this.logger.child({ requestID, requestBy: 'cron' });

    try {
      const messages =
        await this.queueRepository.getAllPendingMessagesQualifiedToBeSent();

      if (!messages?.length) {
        logger.info('no messages to be sent found, skipping');
        return;
      }

      logger.info('getting stages from database');
      const scriptStages = await this.scriptsRepository.getStages();
      if (!scriptStages) {
        throw new Error('no script found in database to get stages');
      }
      logger
        .child({ totalStages: scriptStages.length })
        .info('script stages found');

      const promises = messages?.map(
        async ({ _id, message: { lead_phone_number, next_stage_id } }) => {
          const stage = scriptStages.find(
            (scriptStage) =>
              scriptStage._id.toString() === next_stage_id.toString() // eslint-disable-line no-underscore-dangle
          );
          if (!stage) {
            throw new Error(
              `stage {_id:${next_stage_id}} not found in database`
            );
          }

          const loggerWithPhoneNumber = logger.child({
            phoneNumber: lead_phone_number,
          });

          const lead = await this.leadsRepository.getLead(lead_phone_number);

          const message = this.getMessageFromStage({
            lead,
            stage,
            logger: loggerWithPhoneNumber,
          });

          await this.sendMessage({
            message,
            logger: loggerWithPhoneNumber,
            recipientPhoneNumber: lead_phone_number,
          });

          logger.info('updating message status in queue');
          await this.queueRepository.resolveMessage({
            messageID: _id,
          });
          logger.info('resolved message in queue');

          logger.info('updating actual lead stage in database');
          await this.leadsRepository.updateLead({
            phoneNumber: lead_phone_number,
            stagePosition: stage.position,
            isLockedInThisStage: false,
          });
          logger.info('lead stage updated successfully');
        }
      );

      const results = await Promise.allSettled(promises);
      const errors = [];
      results.forEach((result) => {
        if (result === 'rejected') {
          errors.push(result);
        }
      });

      if (errors.length === promises?.length) {
        logger.error('occurs errors on send all messages');
      } else if (errors.length > 0) {
        logger.warn('some lead was not replied');
      } else {
        logger.info('all leads replied successfully');
      }
    } catch (error) {
      logger.child({ error }).error('error on reply lead');

      throw new Error(`failed to reply lead in service: ${error.message}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getMessageFromStage({ stage, logger, lead }) {
    let message = stage?.message;

    switch (stage?.rules?.alternative_message?.condition) {
      case 'mustHaveReceivedAnyPictureMessagesByNow':
        if (!lead.received_some_image_so_far) {
          logger
            .child({ message })
            .info(
              'using default stage message because user does not sent some image yet'
            );
          break;
        }

        message = stage.rules.alternative_message.message;
        logger
          .child({ message })
          .info(
            'using alternative stage message because next stage have a satisfied condition'
          );
        break;

      default:
        logger.child({ message }).info('using default stage message');
        break;
    }

    return message;
  }

  async sendMessage({ message, logger, recipientPhoneNumber }) {
    if (!message?.template) {
      logger.info('no message by template to send in this stage');
    } else {
      logger
        .child({ template: message.template })
        .info('sending message by template');
      await this.whatsAppBusinessCloudAPI.sendMessageByTemplate(
        message.template,
        recipientPhoneNumber
      );
      logger
        .child({ template: message.template })
        .info('message by template sent successfully');
    }

    if (!message?.text) {
      logger.info('no text message to send in this stage');
    } else {
      logger.child({ text: message?.text }).info('sending message by template');
      await this.whatsAppBusinessCloudAPI.sendTextMessage(
        message.text,
        recipientPhoneNumber
      );
      logger
        .child({ template: message.template })
        .info('text message sent successfully');
    }

    if (!message?.medias?.length) {
      logger.info('no media to send in this stage');
    } else {
      const promises = message.medias.map(async ({ type, url }) => {
        logger.child({ type, url }).info('sending media');
        switch (type) {
          case 'audio':
            await this.whatsAppBusinessCloudAPI.sendAudioMessage(
              recipientPhoneNumber,
              url
            );
            break;
          case 'image':
            await this.whatsAppBusinessCloudAPI.sendImageMessage(
              recipientPhoneNumber,
              url
            );
            break;

          default:
            break;
        }
        logger.child({ type, url }).info('media sent successfully');
      });

      const results = await Promise.allSettled(promises);
      const errors = [];
      results.forEach((result) => {
        if (result === 'rejected') {
          errors.push(result);
        }
      });

      if (errors.length === promises.length) {
        logger.child({ errors }).error('occurs errors on send all audios');
        throw new Error('error on send all audios');
      } else if (errors.length > 0) {
        logger.child({ errors }).warn('some audios was not sent');
      } else {
        logger.child({ results }).info('all audios was sent successfully');
      }
    }
  }
}

module.exports = LeadsService;
