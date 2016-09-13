var respondWithError = function(err, res, defaultMsg) {
	if (err) {
		let errMsgs = [];
		if(err.name=='CastError' && err.kind=='ObjectId') {
			errMsgs.push('User not found.');
		} else if(err.errors) {
			for(let i in err.errors) {
                if(err.errors[i].name=='CastError') {
                    errMsgs.push('Invalid '+err.errors[i].kind.toLowerCase()+'.');
                } else {
				    errMsgs.push(err.errors[i].message);
                }
			}
		}
		res.json({ error: true, message: errMsgs ? errMsgs.join(' ') : (defaultMsg || 'Unknown error.') });
		return true; 
	}
	return false;
}

module.exports = respondWithError;