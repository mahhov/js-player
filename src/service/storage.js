const path = require('path');
const fs = require('fs').promises;
const rootPath = require('env-paths')('js-player').data;
const dwytp = require('dwytpl');

console.log(rootPath);
const STORAGE_DIR = rootPath;
const DOWNLOAD_DIR = 'downloads';
const EXPLORER_DOWNLOAD_DIR = 'tempDownloads';
const PREFERENCES_FILE = 'preferences.json';

class Storage {
	constructor(storageDir, downloadDir, explorerDownloadDir, preferencesFile) {
		this.storageDir_ = path.resolve(storageDir);
		this.downloadDir_ = path.resolve(storageDir, downloadDir);
		this.explorerDownloadDir_ = path.resolve(storageDir, explorerDownloadDir);
		this.preferencesFile_ = path.resolve(storageDir, preferencesFile);

		this.prepareDir_();
	}

	get downloadDir() {
		return this.downloadDir_;
	}

	get explorerDownloadDir() {
		return this.explorerDownloadDir_;
	}

	// uncached
	get explorerDirCount() {
		return fs.readdir(this.explorerDownloadDir_)
			.then(files => files.length);
	}

	async clearExplorerDownloadDir() {
		(await fs.readdir(this.explorerDownloadDir_))
			.forEach(file => fs.unlink(path.resolve(this.explorerDownloadDir_, file)));
	}

	getStoragePath(p) {
		return path.resolve(this.storageDir_, p);
	}

	prepareDir_() {
		return this.prepareDirPromise_ = this.prepareDirPromise_ || new Promise(async (resolve, reject) => {
			await fs.mkdir(this.storageDir_, {recursive: true}).catch(e => reject(e));
			await fs.mkdir(this.downloadDir_, {recursive: true}).catch(e => reject(e));
			await fs.mkdir(this.explorerDownloadDir_, {recursive: true}).catch(e => reject(e));
			resolve();
		});
	}

	// todo can this be removed
	get songList() {
		return this.songListPromise_ = this.songListPromise_ ||
			this.prepareDir_().then(() => fs.readdir(this.downloadDir_));
	}

	async readSong(songName) {
		await this.prepareDir_();
		return fs.readFile(path.resolve(this.downloadDir_, songName))
			.catch(() => fs.readFile(path.resolve(this.explorerDownloadDir_, songName)))
			.catch(async () => {
				let songId = dwytp.Video.idFromFileName(songName);
				let renamedSongName = (await this.songList).find(fileName => dwytp.Video.idFromFileName(fileName) === songId);
				return fs.readFile(path.resolve(this.downloadDir_, renamedSongName));
			});
	}

	get preferences_() {
		return this.preferencesPromise_ = this.preferencesPromise_ ||
			this.prepareDir_()
				.then(() => fs.readFile(this.preferencesFile_, 'utf8'))
				.then(a => JSON.parse(a))
				.catch(() => ({}));
	}

	async updatePreferences_(mergePreferences) {
		let preferences = {...await this.preferences_, ...mergePreferences};
		this.prepareDir_()
			.then(() => fs.writeFile(this.preferencesFile_, JSON.stringify(preferences)))
			.catch(e => console.error('error saving preferences:', e));
		this.preferencesPromise_ = Promise.resolve(preferences);
	}

	get playlists() {
		return this.preferences_.then(preferences => preferences.playlists || []);
	}

	set playlists(playlists) {
		this.updatePreferences_({playlists});
	}

	get shufflePreference() {
		return this.preferences_.then(preferences => preferences.shuffle);
	}

	set shufflePreference(shuffle) {
		this.updatePreferences_({shuffle});
	}

	get fullscreenPreference() {
		return this.preferences_.then(preferences => preferences.fullscreen);
	}

	set fullscreenPreference(fullscreen) {
		this.updatePreferences_({fullscreen});
	}

	get explorerPlaylistPreference() {
		return this.preferences_.then(preferences => preferences.explorerPlaylist || preferences.playlists[0]);
	}

	set explorerPlaylistPreference(explorerPlaylist) {
		this.updatePreferences_({explorerPlaylist});
	}
}

module.exports = new Storage(STORAGE_DIR, DOWNLOAD_DIR, EXPLORER_DOWNLOAD_DIR, PREFERENCES_FILE);
