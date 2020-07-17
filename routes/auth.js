/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

//  This will go in to the register route catch statement
// if (e.code === '23505') {
//     return next(new ExpressError('Username taken. Please pick another!', 400));
// }
