var expect  = require("chai").expect;
var request = require("request");
var path = require('path');
var mongoSeed = require("mongo-seed");
var mongo = require('../config/database').mongo;

var app = require("../app/app.js");

var check_user_info = function(obj, username, adminLevel, expectedPerDay) {
	expect(obj).to.be.an('object');
	expect(obj).to.have.property('data');
	expect(obj.data).to.be.an('object');
	expect(obj.data).to.have.property('username').and.to.equal(username);
	expect(obj.data).to.have.property('adminLevel').and.to.equal(adminLevel);
	expect(obj.data).to.have.property('expectedPerDay').and.to.equal(expectedPerDay);
	expect(obj.data).not.to.have.property('password');
}

var check_meals_array = function(obj, nummeals, userid) {
	expect(obj).to.be.an('object');
	expect(obj).to.have.property('data');
	expect(obj.data).to.be.an('array')
	if(nummeals != null) {
		expect(obj.data).to.have.length(nummeals);
	}
	for(var idx in obj.data) {
		check_meal(obj.data[idx], userid);
	}
}

var check_meal = function(obj, userid) {
	expect(obj).to.be.an('object');
	expect(obj).to.have.property('userid').and.to.be.a('string');
	if(userid != null) {
		expect(obj).to.have.property('userid').and.to.equal(userid);
	}
	expect(obj).to.have.property('dateandtime').and.to.be.a('string');
	expect(obj).to.have.property('description').and.to.be.a('string');
	expect(obj).to.have.property('calories').and.to.be.a('number');
}

var check_error = function(obj, expectedError) {
	expect(obj).to.be.an('object');
	expect(obj).to.have.property('error').and.to.equal(true);
	if(expectedError) {
		expect(obj).to.have.property('message').and.to.eql(expectedError);
	}
}

describe("Calorie Counter", function() {

	var loginurl = "http://localhost:3000/login";
	var userurl = "http://localhost:3000/user";
	var mealsurl = "http://localhost:3000/meals";

	var usersFromSeeds = ['Tim','Bill','Jim','Peter'];
	var userIds = {};
	var userTokens = {};

	before(function (done) {
		this.timeout(10000);
		mongoSeed.clear(mongo.host, mongo.port, mongo.db, function (err) {
			if(err) throw err;
			var seedPath = path.resolve(__dirname + "/../seeds/functionSeeds.js");
			mongoSeed.load(mongo.host, mongo.port, mongo.db, seedPath, "function", function (err) {
				if(err) throw err;

				var getUserIdAndToken = function(username) {

					request.post({
						url: loginurl,
						form: {
							username: username,
							password: 'pw'
						}
					}, function(error, response, body) {
						try { body = JSON.parse(body); } catch(e) {}
						userIds[username] = body.data._id;
						userTokens[username] = body.token;
						if(Object.keys(userIds).length >= usersFromSeeds.length) {
							done();
						}
					});
				}

				for(var i=0; i<usersFromSeeds.length; i++) {
					getUserIdAndToken(usersFromSeeds[i]);
				}

			});
		});
	});

	describe("Login API", function() {

		it("invalid login method - get", function(done) {
			request.get(loginurl, function(error, response, body) {
				expect(response.statusCode).to.equal(404);
				done();
			});
		});

		it("invalid login method - put", function(done) {
			request.put(loginurl, function(error, response, body) {
				expect(response.statusCode).to.equal(404);
				done();
			});
		});

		it("invalid login method - delete", function(done) {
			request.delete(loginurl, function(error, response, body) {
				expect(response.statusCode).to.equal(404);
				done();
			});
		});

		it("attempts login without credentials", function(done) {
			request.post(loginurl, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Missing username.");
				done();
			});
		});

		it("attempts login without password", function(done) {
			request.post({
				url: loginurl,
				form: {
					username: 'Bill'
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Missing password.");
				done();
			});
		});

		it("attempts login with non-existant username", function(done) {
			request.post({
				url: loginurl,
				form: {
					username: 'Billy',
					password: 'pw'
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Incorrect username.");
				done();
			});
		});

		it("attempts login with wrong pw", function(done) {
			request.post({
				url: loginurl,
				form: {
					username: 'Bill',
					password: 'pw2'
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Incorrect password.");
				done();
			});
		});

		it("does login", function(done) {
			request.post({
				url: loginurl,
				form: {
					username: 'Bill',
					password: 'pw'
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_user_info(body, 'Bill', 2, 2200);
				expect(body).to.have.property('token').and.to.be.a('string');
				done();
			});
		});

	});
	
	describe("User API", function() {

		it("attempts to get user record when not logged in", function(done) {
			request.get(userurl, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("gets user record", function(done) {
			request.get({
				url: userurl,
				headers: {
					Authorization: userTokens.Bill
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_user_info(body, 'Bill', 2, 2200);
				done();
			});
		});

		it("attempts to create user without pw", function(done) {
			request.post({
				url: userurl,
				form: {
					username: 'Tom',
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Missing password.");
				done();
			});
		});

		it("attempts to create user with blank username", function(done) {
			request.post({
				url: userurl,
				form: {
					username: '  ',
					password: 'pw',
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Missing username.");
				done();
			});
		});

		it("creates user", function(done) {
			request.post({
				url: userurl,
				form: {
					username: 'Jane',
					password: 'pw'
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_user_info(body, 'Jane', 1, 2640);
				expect(body).to.have.property('token').and.to.be.a('string');
				done();
			});
		});

		it("creates user while logged in", function(done) {
			request.post({
				url: userurl,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					username: 'Julie',
					password: 'pw'
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_user_info(body, 'Julie', 1, 2640);
				done();
			});
		});

		it("attempts create of existing user", function(done) {
			request.post({
				url: userurl,
				form: {
					username: 'Bill',
					password: 'pw'
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Username already in use.");
				done();
			});
		});

		it("attempts to get list of users without login", function(done) {
			request.get(userurl+'/all', function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("attempts to get list of users but invalid admin level", function(done) {
			request.get({
				url: userurl+'/all',
				headers: {
					Authorization: userTokens.Jim
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("gets list of users - admin level 2", function(done) {
			request.get({
				url: userurl+'/all',
				headers: {
					Authorization: userTokens.Bill
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				expect(body).to.have.property('data').and.to.be.an('array');
				expect(body.data[0]).to.be.an('object');
				expect(body.data[0]).to.have.property('username');
				expect(body.data[0]).to.have.property('_id');
				done();
			});
		});

		it("gets list of users - admin level 3", function(done) {
			request.get({
				url: userurl+'/all',
				headers: {
					Authorization: userTokens.Tim
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				expect(body).to.have.property('data').and.to.be.an('array');
				expect(body.data[0]).to.be.an('object');
				expect(body.data[0]).to.have.property('username');
				expect(body.data[0]).to.have.property('_id');
				done();
			});
		});

		it("invalid method for another's user record - post", function(done) {
			request.post(userurl+'/'+userIds.Tim, function(error, response, body) {
				expect(response.statusCode).to.equal(404);
				done();
			});
		});

		it("attempts to get another's user record without login", function(done) {
			request.get(userurl+'/'+userIds.Tim, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("attempts to get another's user record without admin level 2", function(done) {
			request.get({
				url: userurl+'/'+userIds.Tim,
				headers: {
					Authorization: userTokens.Jim
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("attempts to get another's user record with invalid user id", function(done) {
			request.get({
				url: userurl+'/123',
				headers: {
					Authorization: userTokens.Bill
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "User not found.");
				done();
			});
		});

		it("gets another's user record", function(done) {
			request.get({
				url: userurl+'/'+userIds.Tim,
				headers: {
					Authorization: userTokens.Bill
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				expect(body).to.have.property('data').and.to.be.an('object').and.to.have.property('username');
				done();
			});
		});

		it("attempts to update another's user record without login", function(done) {
			request.put({
				url: userurl+'/'+userIds.Tim,
				form: {
					username: 'Charles'
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("attempts to update another's user record without admin level 2", function(done) {
			request.put({
				url: userurl+'/'+userIds.Tim,
				headers: {
					Authorization: userTokens.Jim
				},
				form: {
					username: 'Charles'
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("attempts to update another's user record with invalid user id", function(done) {
			request.put({
				url: userurl+'/123',
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					username: 'Charles'
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "User not found.");
				done();
			});
		});

		it("attempts to update another's user record with invalid admin level", function(done) {
			request.put({
				url: userurl+'/'+userIds.Jim,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					adminLevel: 0
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Invalid admin level.");
				done();
			});
		});

		it("attempts to update another's user record with a blank name", function(done) {
			request.put({
				url: userurl+'/'+userIds.Tim,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					username: ''
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Missing username.");
				done();
			});
		});

		it("attempts to update user record to a higher admin level", function(done) {
			request.put({
				url: userurl+'/'+userIds.Jim,
				headers: {
					Authorization: userTokens.Jim
				},
				form: {
					adminLevel: 2
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Unauthorized change.");
				done();
			});
		});

		it("attempts to update another's user record to an admin level higher than me", function(done) {
			request.put({
				url: userurl+'/'+userIds.Jim,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					adminLevel: 3
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Unauthorized change.");
				done();
			});
		});

		it("updates another's user record", function(done) {
			request.put({
				url: userurl+'/'+userIds.Jim,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					username: 'Charles',
					adminLevel: 2
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_user_info(body, 'Charles', 2, 2400);
				// change admin level back
				request.put({
					url: userurl+'/'+userIds.Jim,
					headers: {
						Authorization: userTokens.Bill
					},
					form: {
						adminLevel: 1
					}
				}, function(error, response, body) {
					try { body = JSON.parse(body); } catch(e) {}
					expect(response.statusCode).to.equal(200);
					check_user_info(body, 'Charles', 1, 2400);
					done();
				});
			});
		});

		it("updates another's password", function(done) {
			request.put({
				url: userurl+'/'+userIds.Tim,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					password: 'pw2'
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				request.post({
					url: loginurl,
					form: {
						username: 'Tim',
						password: 'pw2'
					}
				}, function(error, response, body) {
					try { body = JSON.parse(body); } catch(e) {}
					expect(response.statusCode).to.equal(200);
					check_user_info(body, 'Tim', 3, 2000);
					expect(body).to.have.property('token').and.to.be.a('string');
					done();
				});
			});
		});

		it("attempts to delete another's user record without login", function(done) {
			request.delete(userurl+'/'+userIds.Tim, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("attempts to delete another's user record without admin level 2", function(done) {
			request.delete({
				url: userurl+'/'+userIds.Tim,
				headers: {
					Authorization: userTokens.Jim
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("attempts to delete another's user record with invalid user id", function(done) {
			request.delete({
				url: userurl+'/123',
				headers: {
					Authorization: userTokens.Bill
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				expect(body).to.have.property('data').and.to.equal(null);
				done();
			});
		});

		it("delete another's user record", function(done) {
			request.delete({
				url: userurl+'/'+userIds.Tim,
				headers: {
					Authorization: userTokens.Bill
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				expect(body).to.have.property('data').and.to.equal(null);
				request.get({
					url: userurl+'/'+userIds.Tim,
					headers: {
						Authorization: userTokens.Bill
					}
				}, function(error, response, body) {
					try { body = JSON.parse(body); } catch(e) {}
					expect(response.statusCode).to.equal(200);
					check_error(body, "User not found.");
					done();
				});
			});
		});

	});

	describe("Meals API", function() {

		var mealslists = {};

		it("attempt to get meals records when not logged in", function(done) {
			request.get(mealsurl, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("gets meals records", function(done) {
			request.get({
				url: mealsurl,
				headers: {
					Authorization: userTokens.Bill
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_meals_array(body, 0);
				mealslists.Bill = [];
				for(var i=0; i<body.data.length; i++) {
					mealslists.Bill.push(body.data[i]);
				}
				done();
			});
		});

		it("attempt to get meals records for another user when not admin level 3", function(done) {
			request.get({
				url: mealsurl+'?userid='+userIds.Jim,
				headers: {
					Authorization: userTokens.Bill
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("attempt to get meals records for another user who does not exist", function(done) {
			request.get({
				url: mealsurl+'?userid=123',
				headers: {
					Authorization: userTokens.Peter
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "User not found.");
				done();
			});
		});

		it("gets meals records for another user", function(done) {
			request.get({
				url: mealsurl+'?userid='+userIds.Jim,
				headers: {
					Authorization: userTokens.Peter
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_meals_array(body, 3, userIds.Jim);
				mealslists.Jim = [];
				for(var i=0; i<body.data.length; i++) {
					mealslists.Jim.push(body.data[i]);
				}
				done();
			});
		});
			
		it("attempt to create a meal when not logged in", function(done) {
			request.post({
				url: mealsurl,
				form: {
					dateandtime: (new Date('2016-04-04 10:00:00')).toJSON(),
					description: "Pancakes",
					calories: 380
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("attempt to create a meal record with missing parameter", function(done) {
			request.post({
				url: mealsurl,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					dateandtime: (new Date('2016-04-04 10:00:00')).toJSON(),
					description: "Pancakes"
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Missing calories.");
				done();
			});
		});

		it("attempt to create meal record with invalid date", function(done) {
			request.post({
				url: mealsurl,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					dateandtime: "Forever",
					description: "Pancakes",
					calories: 380
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(response.statusCode).to.equal(200);
				check_error(body, "Invalid date.");
				done();
			});
		});

		it("create meal record", function(done) {
			request.post({
				url: mealsurl,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					dateandtime: (new Date('2016-04-04 10:00:00')).toJSON(),
					description: "Pancakes",
					calories: 380
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				check_meal(body.data, userIds.Bill);
				done();
			});
		});

		it("attempt to create a meal record for another user when not admin level 3", function(done) {
			request.post({
				url: mealsurl,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					userid: userIds.Jim,
					dateandtime: (new Date('2016-04-04 10:00:00')).toJSON(),
					description: "Waffles",
					calories: 380
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("creates meal record for another user", function(done) {
			request.post({
				url: mealsurl,
				headers: {
					Authorization: userTokens.Peter
				},
				form: {
					userid: userIds.Jim,
					dateandtime: (new Date('2016-04-04 10:00:00')).toJSON(),
					description: "Waffles",
					calories: 380
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				check_meal(body.data, userIds.Jim);
				done();
			});
		});
			
		it("attempt to update a meal when not logged in", function(done) {
			request.put({
				url: mealsurl+'/'+mealslists.Jim[0]._id,
				form: {
					description: "Toast"
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("update meal record", function(done) {
			request.put({
				url: mealsurl+'/'+mealslists.Jim[0]._id,
				headers: {
					Authorization: userTokens.Jim
				},
				form: {
					description: "Toast"
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				check_meal(body.data, userIds.Jim);
				expect(body.data).to.have.property('_id').and.to.equal(mealslists.Jim[0]._id);
				expect(body.data).to.have.property('description').and.to.equal('Toast');
				done();
			});
		});

		it("attempt to update a meal record for another user when not admin level 3", function(done) {
			request.put({
				url: mealsurl+'/'+mealslists.Jim[0]._id,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					userid: userIds.Jim,
					description: "Pop Tarts"
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("update meal record for another user", function(done) {
			request.put({
				url: mealsurl+'/'+mealslists.Jim[0]._id,
				headers: {
					Authorization: userTokens.Peter
				},
				form: {
					userid: userIds.Jim,
					description: "Pop Tarts"
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				check_meal(body.data, userIds.Jim);
				expect(body.data).to.have.property('description').and.to.equal('Pop Tarts');
				done();
			});
		});
			
		it("attempt to delete a meal when not logged in", function(done) {
			request.delete(mealsurl+'/'+mealslists.Jim[0]._id, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("delete meal record", function(done) {
			request.delete({
				url: mealsurl+'/'+mealslists.Jim[0]._id,
				headers: {
					Authorization: userTokens.Jim
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(body).to.eql({data:null});
				request.get({
					url: mealsurl,
					headers: {
						Authorization: userTokens.Jim
					}
				}, function(error, response, body) {
					try { body = JSON.parse(body); } catch(e) {}
					expect(response.statusCode).to.equal(200);
					expect(body.data).to.have.length(mealslists.Jim.length);  //created one above for Jim, now deleted one here - thus the length should be what it was originally
					done();
				});
			});
		});

		it("attempt to delete non-existing meal record", function(done) {
			request.delete({
				url: mealsurl+'/'+mealslists.Jim[0]._id,
				headers: {
					Authorization: userTokens.Jim
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(body).to.eql({data:null});
				done();
			});
		});

		it("attempt to delete a meal record for another user when not admin level 3", function(done) {
			request.delete({
				url: mealsurl+'/'+mealslists.Jim[1]._id,
				headers: {
					Authorization: userTokens.Bill
				},
				form: {
					userid: userIds.Jim
				}
			}, function(error, response, body) {
				expect(response.statusCode).to.equal(401);
				done();
			});
		});

		it("delete meal record for another user", function(done) {
			request.delete({
				url: mealsurl+'/'+mealslists.Jim[1]._id,
				headers: {
					Authorization: userTokens.Peter
				},
				form: {
					userid: userIds.Jim
				}
			}, function(error, response, body) {
				try { body = JSON.parse(body); } catch(e) {}
				expect(body).to.eql({data:null});
				request.get({
					url: mealsurl+'?userid='+userIds.Jim,
					headers: {
						Authorization: userTokens.Peter
					},
				}, function(error, response, body) {
					try { body = JSON.parse(body); } catch(e) {}
					expect(response.statusCode).to.equal(200);
					expect(body.data).to.have.length(mealslists.Jim.length-1);
					done();
				});
			});
		});
			

	});
});


