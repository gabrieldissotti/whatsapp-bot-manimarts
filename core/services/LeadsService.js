class LeadsService {
  constructor({
    leadsRepository,
    scriptsRepository,
    whatsAppBusinessCloudAPI,
    logger,
  }) {
    this.leadsRepository = leadsRepository;
    this.scriptsRepository = scriptsRepository;
    this.whatsAppBusinessCloudAPI = whatsAppBusinessCloudAPI;
    this.logger = logger;
  }

  async replyLead({ recipientPhoneNumber }) {
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
        .child({ actualStage: nextStage.position })
        .info('selected actual stage');

      if (!nextStage?.message?.template) {
        logger.info('no message by template to send in this stage');
      } else {
        logger
          .child({ template: nextStage.message.template })
          .info('sending message by template');
        await this.whatsAppBusinessCloudAPI.sendMessageByTemplate(
          nextStage.message.template,
          recipientPhoneNumber
        );
        logger
          .child({ template: nextStage.message.template })
          .info('message by template sent successfully');
      }

      if (!nextStage?.message?.medias?.length) {
        logger.info('no media to send in this stage');
      } else {
        nextStage.message.medias.map(async ({ type, url }) => {
          logger.child({ type, url }).info('sending media');
          switch (type) {
            case 'audio':
              await this.whatsAppBusinessCloudAPI.sendAudioMessage(
                recipientPhoneNumber,
                url
              );
              break;

            default:
              break;
          }
          logger.child({ type, url }).info('media sent successfully');
        });
      }

      logger.info('updating actual lead stage in database');
      await this.leadsRepository.updateLead({
        phoneNumber: recipientPhoneNumber,
        stagePosition: nextStage.position,
      });
      logger.info('lead stage updated successfully');
      logger.info('lead replied successfully');
    } catch (error) {
      logger.child({ error }).error('error on reply lead');

      throw new Error(`failed to replay lead in service: ${error.message}`);
    }
  }
}

module.exports = LeadsService;
