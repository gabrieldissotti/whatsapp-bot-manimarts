import {
  sendAudioMessage,
  sendMessageByTemplate,
} from '../../infra/apis/WhatsAppBusinessCloudAPI';

export default function leadsService({ leadsRepository, scriptsRepository }) {
  return {
    replyLead: async ({ recipientPhoneNumber }) => {
      if (!recipientPhoneNumber)
        throw new Error('phone number is not present in webhook payload');

      const leadStage = await leadsRepository.getLeadStage(
        recipientPhoneNumber
      );

      const scriptStages = scriptsRepository.getStages();

      const nextStage = scriptStages.find(
        (stage) => stage.position === leadStage.position + 1
      );

      if (nextStage?.template) {
        await sendMessageByTemplate(nextStage.template, recipientPhoneNumber);
      }

      nextStage?.medias?.map(async ({ type, url }) => {
        switch (type) {
          case 'audio':
            await sendAudioMessage(recipientPhoneNumber, url);
            break;

          default:
            break;
        }
      });

      await leadsRepository.updateLeadStage(recipientPhoneNumber, nextStage);
    },
  };
}
