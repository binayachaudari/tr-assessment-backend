const dotenv = require('dotenv');
const { str, url, cleanEnv, port } = require('envalid');

dotenv.config();

const validateEnv = () => {
  const env = cleanEnv(process.env, {
    MONGODB_URI: url({ desc: 'MongoDB URI' }),
    JWT_SECRET: str({ desc: 'JWT Secret' }),
    PORT: port({ desc: 'Port ' }),
    ALLOWED_ORIGINS: str({ desc: 'Allowed Origins' }),
  });

  return env;
};

module.exports = validateEnv;
