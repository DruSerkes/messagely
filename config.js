/** Common config for message.ly */

// read .env files and make environmental variables

require('dotenv').config();

const DB_URI = process.env.NODE_ENV === 'test' ? 'postgresql:///messagely_test' : 'postgresql:///messagely';

const SECRET_KEY = process.env.SECRET_KEY || 'secret';

const BCRYPT_WORK_FACTOR = 12;

const ACCOUNT_SID = process.env.ACCOUNT_SID;

const AUTH_TOKEN = process.env.AUTH_TOKEN;

const MY_PHONE_NUMBER = process.env.MY_PHONE_NUMBER;

const TRIAL_NUMBER = process.env.TRIAL_NUMBER;

module.exports = {
	DB_URI,
	SECRET_KEY,
	BCRYPT_WORK_FACTOR,
	ACCOUNT_SID,
	AUTH_TOKEN,
	MY_PHONE_NUMBER,
	TRIAL_NUMBER
};
