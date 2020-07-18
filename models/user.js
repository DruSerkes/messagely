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
			`SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone 
	  FROM messages AS m
	  JOIN users AS u ON m.to_username = u.username 
      WHERE from_username = $1
      `,
			[ username ]
		);
		if (!results.rows.length) throw new ExpressError('Messages not found', 404);

		return results.rows.map((m) => ({
			id      : m.id,
			body    : m.body,
			sent_at : m.sent_at,
			read_at : m.read_at,
			to_user : {
				username   : m.username,
				first_name : m.first_name,
				last_name  : m.last_name,
				phone      : m.phone
			}
		}));
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
			`SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone
	  FROM messages AS m
	  JOIN users AS u ON m.from_username = u.username
      WHERE to_username = $1
      `,
			[ username ]
		);
		if (!results.rows.length) throw new ExpressError('Messages not found', 404);
		return results.rows.map((m) => ({
			id        : m.id,
			body      : m.body,
			sent_at   : m.sent_at,
			read_at   : m.read_at,
			from_user : {
				username   : m.username,
				first_name : m.first_name,
				last_name  : m.last_name,
				phone      : m.phone
			}
		}));
	}
}

module.exports = User;
