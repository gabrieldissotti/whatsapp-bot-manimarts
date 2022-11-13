import { LeadSchema } from '../../infra/databases/mongodb/schemas';

export default async function scriptsRepository({ connection }) {
  const db = await connection;
  const ScriptModel = db.model('Script', LeadSchema);

  return {
    async getStages() {
      const script = await ScriptModel.findOne();

      return script.stages;
    },
  };
}
