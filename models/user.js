/** User class for message.ly */

const { DB_URI, BCRYPT_WORK_FACTOR } = require('../config');
const bcrypt = require('bcrypt');
const ExpressError = require('../expressError');
const db = require('../db');

/** User of the site. */

class User {
	/** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

	static async register({ username, password, first_name, last_name, phone }) {
		if (!username || !password) throw new ExpressError('username/password required', 400);
		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
		const result = await db.query(
			`INSERT INTO users(
          username,
          password,
          first_name,
          last_name, 
          phone, 
          join_at, 
          last_login_at)
          VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
          RETURNING username, password, first_name, last_name, phone
        `,
			[ username, hashedPassword, first_name, last_name, phone ]
		);
		const user = result.rows[0];
		return user;
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		if (!username || !password) throw new ExpressError('username/password required', 400);
		const result = await db.query(
			`SELECT username, password
        FROM users
        WHERE username = $1
        `,
			[ username ]
		);
		if (!result.rows.length) throw new ExpressError('User not found', 404);
		const user = result.rows[0];
		return await bcrypt.compare(password, user.password);
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		if (!username) throw new ExpressError('username required', 400);
		const result = await db.query(
			`UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      `,
			[ username ]
		);
	}

	/** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		const results = await db.query(
			`SELECT username, first_name, last_name, phone
      FROM users
      `
		);
		const users = results.rows;
		return users;
	}

	/** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

	static async get(username) {
		if (!username) throw new ExpressError('username required', 400);
		const result = await db.query(
			`SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1
      `,
			[ username ]
		);
		const user = result.rows[0];
		return user;
	}

	/** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

	static async messagesFrom(username) {
		if (!username) throw new ExpressError('username required', 400);
		const results = await db.query(
			`SELECT id, to_username, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1
      `,
			[ username ]
		);
		if (!results.rows.length) throw new ExpressError('Messages not found', 404);
		console.log(results.rows);
		const messages = results.rows;
		return messages;
	}

	/** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

	static async messagesTo(username) {
		if (!username) throw new ExpressError('username required', 400);
		const results = await db.query(
			`SELECT id, from_username, body, sent_at, read_at
      FROM messages
      WHERE to_username = $1
      `,
			[ username ]
		);
		if (!results.rows.length) throw new ExpressError('Messages not found', 404);
		const messages = results.rows;
		return messages;
	}
}

module.exports = User;
