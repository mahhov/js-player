const styleSharing = require('shadow-dom-style-sharing');
require('./xelements/import');

document.addEventListener('DOMContentLoaded', () => {
	let $ = query =>
		document.querySelector(query);

	styleSharing.process(document);
});

// todo
// keyboard shortcuts, global and local, skip/rewind 5 seconds, skip/rewind song, pause play
// select player song from clicking on song from list
// way to delete songs from list and player frames, and refresh download frame status and player
// notifications on download and song change
// fix playlist panel button fa icons
// ui to have less refresh buttons, automatically refresh player and list on new download
// ui to look good
