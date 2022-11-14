class LeadsService {
  constructor({
    leadsRepository,
    scriptsRepository,
    whatsAppBusinessCloudAPI,
  }) {
    this.leadsRepository = leadsRepository;
    this.scriptsRepository = scriptsRepository;
    this.whatsAppBusinessCloudAPI = whatsAppBusinessCloudAPI;
  }

  async replyLead({ recipientPhoneNumber }) {
    try {
      if (!recipientPhoneNumber)
        throw new Error('phone number is not present in webhook payload');

      let lead = await this.leadsRepository.getLead(recipientPhoneNumber);
      let isFirstContact = false;
      if (!lead) {
        isFirstContact = true;
        lead = this.leadsRepository.createLead({
          phoneNumber: recipientPhoneNumber,
          name: 'Unnamed yet',
          stagePosition: 0,
        });
      }

      const scriptStages = await this.scriptsRepository.getStages();
      if (!scriptStages) {
        throw new Error('no script found in database to get stages');
      }

      let nextStage = scriptStages[0];
      if (!isFirstContact) {
        nextStage = scriptStages.find(
          (stage) => stage.position === lead.stage_position + 1
        );
      }

      if (nextStage?.message?.template) {
        await this.whatsAppBusinessCloudAPI.sendMessageByTemplate(
          nextStage.message.template,
          recipientPhoneNumber
        );
      }

      nextStage?.message?.medias?.map(async ({ type, url }) => {
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
      });

      await this.leadsRepository.updateLead({
        phoneNumber: recipientPhoneNumber,
        stagePosition: nextStage.position,
      });
    } catch (error) {
      console.error(error);
      throw new Error(`failed to replay lead in service: ${error.message}`);
    }
  }
}

module.exports = LeadsService;
