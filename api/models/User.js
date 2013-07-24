/*---------------------
	:: User
	-> model
---------------------*/
var hasher = require("password-hash");
module.exports = {

	 attributes  : {
        username: {
        	type : 'string',
        	require : true,
        	minLength : 2,

        },
        password: {
        	type : 'string',
        	require : true,
        	maxLength : 5,
      		columnName: 'encrypted_password'
        },
        state: 'STRING'
    }
};
