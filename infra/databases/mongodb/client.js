import mongoose from 'mongoose';

import getConfig from 'next/config';

const {
  serverRuntimeConfig: {
    database: {
      mongodbDSN,
    },
  },
} = getConfig();

export default mongoose.connect(mongodbDSN);
