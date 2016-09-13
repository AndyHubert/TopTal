var ObjectId = require('mongodb').ObjectID;

var ObjectIds = {
    Tim: new ObjectId(),
    Peter: new ObjectId(),
    Bill: new ObjectId(),
    Jim: new ObjectId()
};

module.exports = function() {
	return {
		"users": [
            {
                "_id": ObjectIds.Tim,
                "username": "Tim",
                "password": "$2a$10$XkO4dcAwfc8tWGAsgoHw5elombId2ZHhZDP9FR9pTcYOVxLEONiby",
                "adminLevel": 3,
                "expectedPerDay": 2000    
            },
            {
                "_id": ObjectIds.Peter,
                "username": "Peter",
                "password": "$2a$10$XkO4dcAwfc8tWGAsgoHw5elombId2ZHhZDP9FR9pTcYOVxLEONiby",
                "adminLevel": 3,
                "expectedPerDay": 2000    
            },
            {
                "_id": ObjectIds.Bill,
                "username": "Bill",
                "password": "$2a$10$XkO4dcAwfc8tWGAsgoHw5elombId2ZHhZDP9FR9pTcYOVxLEONiby",
                "adminLevel": 2,
                "expectedPerDay": 2200    
            },
            {
                "_id": ObjectIds.Jim,
                "username": "Jim",
                "password": "$2a$10$XkO4dcAwfc8tWGAsgoHw5elombId2ZHhZDP9FR9pTcYOVxLEONiby",
                "adminLevel": 1,
                "expectedPerDay": 2400    
            }
        ],
		"meals": [
            {
                "userid": ObjectIds.Peter,
                "dateandtime": "2016-09-02T06:00:00.000Z",
                "description": "French toast",
                "calories": 500
            },
            {
                "_id": new ObjectId(5),
                "userid": ObjectIds.Peter,
                "dateandtime": "2016-09-02T11:00:00.000Z",
                "description": "Sandwiches",
                "calories": 400
            },
            {
                "_id": new ObjectId(6),
                "userid": ObjectIds.Jim,
                "dateandtime": "2016-09-02T05:00:00.000Z",
                "description": "Cereal",
                "calories": 550
            },
            {
                "_id": new ObjectId(7),
                "userid": ObjectIds.Jim,
                "dateandtime": "2016-09-02T10:00:00.000Z",
                "description": "Hamburger",
                "calories": 700
            },
            {
                "_id": new ObjectId(8),
                "userid": ObjectIds.Jim,
                "dateandtime": "2016-09-02T18:00:00.000Z",
                "description": "Pizza",
                "calories": 900
            }
        ]
    };
}