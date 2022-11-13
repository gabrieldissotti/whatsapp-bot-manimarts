import { LeadSchema } from '../../infra/databases/mongodb/schemas';

export default async function leadsRepository({ connection }) {
  const db = await connection;
  const LeadModel = db.model('Lead', LeadSchema);

  return {
    async getLeadStage(recipientPhoneNumber) {
      const lead = await LeadModel.findOne({
        phoneNumber: recipientPhoneNumber,
      });

      return lead.stage;
    },
  };
}
