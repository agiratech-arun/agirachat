Meteor.publish('snippetedMessage', function(_id) {
	if (typeof this.userId === 'undefined' || this.userId === null) {
		return this.ready();
	}

	const snippet = RocketChat.models.Messages.findOne({'_id': _id, snippeted: true});
	const user = RocketChat.models.Users.findOneById(this.userId);
	const roomSnippetQuery = {
		'_id': snippet.rid,
		'usernames': {
			'$in': [
				user.username
			]
		}
	};

	if (RocketChat.models.Rooms.findOne(roomSnippetQuery) === undefined) {
		return this.ready();
	}

	const publication = this;


	if (typeof user === 'undefined' || user === null) {
		return this.ready();
	}

	const cursor = RocketChat.models.Messages.find(
		{ '_id': _id }
	).observeChanges({
		added: function(_id, record) {
			publication.added('rocketchat_snippeted_message', _id, record);
		},
		changed: function(_id, record) {
			publication.changed('rocketchat_snippeted_message', _id, record);
		},
		removed: function(_id) {
			publication.removed('rocketchat_snippeted_message', _id);
		}
	});

	this.ready();

	this.onStop = function() {
		cursor.stop();
	};
});
