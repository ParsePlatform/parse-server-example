/*
 *	Parse Cloud Code
 *
 *	Documentation:
 *	https://www.parse.com/docs/js/guide#cloud-code
 *	This URL will probably change to a github url
 *
 *	FOLDERS:
 *
 *	config
 *	contains a JSON configuration file that you shouldn't normally need to deal with
 *
 *	cloud
 *	stores your Cloud Code
 *
 *	public
 *	stores any static content that you want to host on the Parse Server
 *
 *	When you are done editing any of these files,
 *	deploy the changes using git/Git Hub/Git Desktop
 */

/*
 *	Barbershop Apps Methods
 *	These are to connect to and use Parse Server
 *
 *
 *	To use Parse Server you need the following:
 *
 *	Application ID
 *	in APP_ID
 *
 *	Database URI
 *	in DATABASE_URI
 *
 *	File Key
 *	in FILE_KEY
 *
 *	Master Key
 *	in MASTER_KEY
 *
 *	Parse Mount Path
 *	PARSE_MOUNT
 *
 *	The Server URL that the app will use
 *	in SERVER_URL
 *
 */

//do I need to require app.js?
//require('./cloud/app.js');


//////////////////////////////////////
//
// hello
//
//////////////////////////////////////
Parse.Cloud.define('hello', function(req, res)
{
  res.success('I am not really dreaming of being a website, instead I am dreaming of being the back end to an app... SUCCESS!');
});


///////////////////////////////////////
//
// status
//
///////////////////////////////////////
Parse.Cloud.define('status', function(request, response)
{
	response.success('Up, Plateau, Valid');
});


///////////////////////////////////////
//
// barberIdForBarberName
//
///////////////////////////////////////
Parse.Cloud.define('barberIdForBarberName', function(request, response)
{
	Parse.Cloud.useMasterKey();
	var query = new Parse.Query('Barbers');
	query.equalTo('barberName', request.params.barberName);
	query.equalTo('isActive', true);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 1 )
			{
				var barberId = results[0].id;
				response.success(barberId);
			}
			else if ( results.length > 1 )
			{
				response.error('more than one barber found');
			}
			else
			{
				response.error('no barbers found with that name');
			}
		},
		error: function(error)
		{
			response.error('barber name lookup failed: ' + error);
		}
	});
});


///////////////////////////////////////
//
// canReplyToUserWithId
//
///////////////////////////////////////
Parse.Cloud.define('canReplyToUserWithId', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	var User = Parse.Object.extend('_User');
	var query = new Parse.Query(User);
	query.equalTo('objectId', request.params.userId);
	query.get(
	{
		success: function(result)
		{
			var canReply = result.get('allowsMessages');
			if ( canReply == null )
			{
				canReply = false;
			}
			response.success(canReply);
		},
		error: function(error)
		{
			response.error('user lookup failed');
		}
	});
});


///////////////////////////////////////
//
// doesMessageToUserWithNoRepeatHashExist
//
///////////////////////////////////////
Parse.Cloud.define('doesMessageToUserWithNoRepeatHashExist', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	var userId = request.params.userId;
	var nrHash = request.params.noRepeat;

	var query = new Parse.Query('Messages');
	query.equalTo('userID', request.params.userId);
	query.equalTo('noRepeat', request.params.noRepeat);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 0 )
			{
				response.success(false);
			}
			else
			{
				response.success(true);
			}
		},
		error: function(error)
		{
			response.error('message lookup failed: ' + error);
		}
	});
});


///////////////////////////////////////
//
// nameForUserWithObjectId
//
///////////////////////////////////////
Parse.Cloud.define('nameForUserWithObjectId', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	var User = Parse.Object.extend('_User')
	var query = new Parse.Query(User);
	query.get(request.params.objectId,
	{
		success: function(object)
		{
			// object is an instance of Parse.Object.
			var firstName = object.get('firstName');
			if ( firstName == null )
			{
				firstName = '';
			}
			var lastName = object.get('lastName');
			if ( lastName == null )
			{
				lastName = '';
			}
			var fullName = firstName.trim() + ' ' + lastName.trim();

			response.success(fullName.trim());
		},
		error: function(error)
		{
			// error is an instance of Parse.Error.
			response.error('unable to get user with object id: ' + error);
		}
	});
});

///////////////////////////////////////
//
// serviceIdForBarberNameAndServiceName
//
///////////////////////////////////////
Parse.Cloud.define('serviceIdForBarberNameAndServiceName', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	var query = new Parse.Query('Services');
	query.equalTo('barberName', request.params.barberName);
	query.equalTo('serviceName', request.params.serviceName);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 1 )
			{
				var service = results[0];
				var isActive = service.get('isActive');
				var serviceId = '';
				if ( isActive == true )
				{
					serviceId = service.id;
				}
				else
				{
					var replacement = service.get('replacement');
					if ( replacement != null )
					{
						serviceId = replacement.id;
					}
					else
					{
						serviceId = null;
					}
				}
				response.success(serviceId);
			}
			else if ( results.length > 1 )
			{
				response.error('more than one service found');
			}
			else
			{
				response.error('no services found for barber name and service name');
			}
		},
		error: function(error)
		{
			response.error('service name lookup failed: ' + error);
		}
	});
});


///////////////////////////////////////
//
// serviceIdForServiceIdReplacement
//
///////////////////////////////////////
Parse.Cloud.define('serviceIdForServiceIdReplacement', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	var query = new Parse.Query('Services');
	query.equalTo('objectId', request.params.serviceId);
	query.equalTo('isActive', false);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 0 )
			{
				response.success(request.params.serviceId);
			}
			else
			{
				var replacement = results[0].get('replacement');
				response.success(replacement.id);
			}
		},
		error: function(error)
		{
			response.error('service id replacement lookup failed: ' + error);
		}
	});
});

///////////////////////////////////////
//
// servicesForBarberId
//
///////////////////////////////////////
Parse.Cloud.define('servicesForBarberId', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	var query = new Parse.Query('Barbers');
	query.equalTo('objectId', request.params.barber);
	query.find( 
	{
		success: function(results)
		{
			var relation = results[0].get('services');
			var relationQuery = relation.query;
			relationQuery.equalTo('isActive', true);
			relationQuery.find( 
			{
				success: function(results)
				{
					response.success(results);
				},
				error: function(error)
				{
					response.error('services lookup failed: ' + error);
				}
			});
		},
		error: function(error2)
		{
			response.error('barber lookup failed ' + error2);
		}
	});
});


///////////////////////////////////////
//
// incrementNewAppointmentTally
//
///////////////////////////////////////
Parse.Cloud.define('incrementNewAppointmentTally', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	var query = new Parse.Query('GlobalSettings');
	query.equalTo('settingName', 'newAppointmentTally');

	query.find(
	{
		success: function(results)
		{
			var resultObject = results[0];
			var tally = parseInt(resultObject.get('settingValue'));
			tally++;

			var tallyString = String.valueOf(tally);
			//resultObject.set('settingValue', tallyString);
			resultObject.save({'settingValue':tallyString});

			response.success(tally);
		},
		error: function(error)
		{
			response.error(error);
		}
	});
});


///////////////////////////////////////
//
// getUnreadMessageCount
//
///////////////////////////////////////
Parse.Cloud.define('getUnreadMessageCount', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	// Unread Messages
	var query = new Parse.Query('Messages');
	query.equalTo('recipientID', request.params.installId);
	query.doesNotExist('readAt');
	
	conditionalLog('Getting Unread Messages Count for recipient [' + request.params.installId + ']');

	query.find(
	{
		success: function(results)
		{
			conditionalLog('SUCCESS: ');
			response.success(results.count);
		},
		error: function(error)
		{
			conditionalLog('ERROR: ');
			response.error('unable to get unread messages: ' + error);
		}
	});
});


///////////////////////////////////////
//
// getMessageCount
//
///////////////////////////////////////
Parse.Cloud.define('getMessageCount', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	// Unread Messages
	var query = new Parse.Query('Messages');
	query.equalTo('recipientID', request.params.installId);
	
	conditionalLog('Getting Messages Count for recipient [' + request.params.installId + ']');

	query.find(
	{
		success: function(results)
		{
			conditionalLog('SUCCESS: ');
			response.success(results.count);
		},
		error: function(error)
		{
			conditionalLog('ERROR: ');
			response.error('unable to get messages: ' + error);
		}
	});
});


///////////////////////////////////////
//
// loginUser
//
///////////////////////////////////////
Parse.Cloud.define('loginUser', function(req, res) 
{
	Parse.Cloud.useMasterKey();

	// Phone Number
	var phoneNumber		= req.params.phoneNumber;
	phoneNumber		= phoneNumber.replace(/\D/g, '');

	// Verification Code
	var verificationCode 	= req.params.verificationCode;
	verificationCode 	= verificationCode.replace(/\D/g, '');

	// User Service Token
	var userServiceToken	= process.env.USER_SERVICE_TOKEN;
	
	if (!phoneNumber || phoneNumber.length != 10)
	{
		return res.error('Phone Number missing or invalid length');
	}

	if (!verificationCode || verificationCode.length < 4 || verificationCode.length > 6)
	{
		return res.error('Verification Code missing or invalid length');
	}

	Parse.User.logIn(phoneNumber, userServiceToken + '-' + verificationCode).then(function (user)
	{
		var dateTime = new Date();
    		user.set('lastSeen',dateTime);
		user.save();
		res.success(user.getSessionToken());
	}
	,function (error)
	{
		res.error(error);
	});
});


///////////////////////////////////////
//
// convertMessagesFromDeviceToUser
//
///////////////////////////////////////
Parse.Cloud.define('convertMessagesFromDeviceToUser', function(request, response)
{
	Parse.Cloud.useMasterKey();
	
	// All Messages
	var installId = request.params.installId;
	var userId = request.params.userId;

	var query = new Parse.Query('Messages');
	query.equalTo('recipientID', installId);
	query.doesNotExist('userID');
	query.find(
	{
		success: function(results)
		{
			conditionalLog('Testing Converting');
			conditionalLog('found: ' + results.length);
			if ( results.length == 0 )
			{
				response.success('no messages to convert');
				//conditionalLog('none to convert');
			}
			else
			{
				for ( m = 0; m < results.length; m++ )
				{
					//conditionalLog(results[m].objectId);
					if ( m == 0 )
					{
						results[m].set('userID', userId);
						results[m].save();
					}
				}
				var count = results.length;
				var countStr  = count.toString();
				var reply = 'converted ' + countStr + ' messages';
				response.success(reply);
			}
		},
		error: function(error)
		{
			response.error('unable to convert messages ' + error);
		}
	});
});


///////////////////////////////////////
//
// convertUsernameToPhoneNumber
//
///////////////////////////////////////
Parse.Cloud.define('convertUsernameToPhoneNumber', function(request, response) 
{
	Parse.Cloud.useMasterKey();
	
	var userServiceToken = process.env.USER_SERVICE_TOKEN;
	
	var tLen = userServiceToken.length();
	
	conditionalLog('Service Token Length: ' + tLen);
	
	var emailAddress = request.params.emailAddress;
	var phoneNumber  = request.params.phoneNumber;
	
	conditionalLog('emailAddress [' + emailAddress + ']');
	conditionalLog('phoneNumber [' + phoneNumber + ']');
	
	var User = Parse.Object.extend('_User');
	var query = new Parse.Query(User);
	
	query.equalTo('username',emailAddress);
	query.find(
	{
		success: function(results)
		{
			if ( results.length == 0 )
			{
				conditionalLog('No records to convert');
				response.success('');
			}
			else
			{
				conditionalLog('converting user');
				var theUser = results[0];
				var random  = randomNumberWithNumberOfDigits(5);
				
				theUser.setPassword(userServiceToken + '-' + random);
				theUser.set('username', phoneNumber);
				theUser.save();
				
				response.success(random);
			}
		},
		error: function(err)
		{
			conditionalLog('ERROR! ' + err);
			response.error(err);
		}
	});
});

		   
///////////////////////////////////////
//
// randomNumberWithNumberOfDigits - not public
//
///////////////////////////////////////
function randomNumberWithNumberOfDigits(numDigits)
{
	var num = '';

	for(d = 0; d < numDigits; d++)
	{
		var min = 0;
		var max = 9;
		var digit = Math.floor(Math.random() * (max - min + 1)) + min;

		num = num + digit.toString();
	}

	return num;
}


///////////////////////////////////////
//
// conditionalLog - not public
//
///////////////////////////////////////
function conditionalLog(logText)
{
	var doLog = env.process.DEBUG_LOG
	if ( doLog == True || doLog == "True" )
	{
		console.log(logText);
	}
}
