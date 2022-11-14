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

      console.log(
        `eadsService: {phone: ${recipientPhoneNumber}} |recipient phone number ok`
      );

      let lead = await this.leadsRepository.getLead(recipientPhoneNumber);
      let isFirstContact = false;
      if (!lead) {
        console.log(
          `LeadsService: {phone: ${recipientPhoneNumber}} | it's the first contact`
        );
        isFirstContact = true;
        lead = this.leadsRepository.createLead({
          phoneNumber: recipientPhoneNumber,
          name: 'Unnamed yet',
          stagePosition: 0,
        });
        console.log(
          `LeadsService: {phone: ${recipientPhoneNumber}} | lead created successfully`
        );
      }

      const scriptStages = await this.scriptsRepository.getStages();
      console.log(
        `LeadsService: {phone: ${recipientPhoneNumber}} | script stages ok | count: ${scriptStages.length}`
      );
      if (!scriptStages) {
        throw new Error('no script found in database to get stages');
      }

      let nextStage = scriptStages[0];
      if (!isFirstContact) {
        console.log(
          `LeadsService: {phone: ${recipientPhoneNumber}} | it's the ${
            lead.stage_position + 1
          }º contact`
        );
        nextStage = scriptStages.find(
          (stage) => stage.position === lead.stage_position + 1
        );
      }

      console.log(
        `LeadsService: {phone: ${recipientPhoneNumber}} | actual stage ${JSON.stringify(
          nextStage
        )}º`
      );

      if (nextStage?.message?.template) {
        console.log(
          `LeadsService: {phone: ${recipientPhoneNumber}} | sending first text message`
        );
        await this.whatsAppBusinessCloudAPI.sendMessageByTemplate(
          nextStage.template,
          recipientPhoneNumber
        );
      } else {
        console.log(
          `LeadsService: {phone: ${recipientPhoneNumber}} | stage does not have message by template, skipping`
        );
      }

      nextStage?.message?.medias?.map(async ({ type, url }) => {
        console.log(
          `LeadsService: {phone: ${recipientPhoneNumber}} | sending media in ${nextStage.position}º stage | {media: ${url}}`
        );
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
      if (!nextStage?.message?.medias?.length) {
        console.log(
          `LeadsService: {phone: ${recipientPhoneNumber}} | stage does not have any media message, skipping`
        );
      }

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
