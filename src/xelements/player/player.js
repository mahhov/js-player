const template = require('fs').readFileSync(`${__dirname}/player.html`, 'utf8');
const XElement = require('../XElement');
const path = require('path');
const songStorage = require('../../service/SongStorage');

customElements.define('x-player', class Player extends XElement {
	static get observedAttributes() {
		return ['src'];
	}

	constructor() {
		super(template);
	}

	connectedCallback() {
		this.onVolumeChange_();
		this.$('audio').addEventListener('volumechange', () => this.onVolumeChange_());
		this.$('audio').addEventListener('timeupdate', () => this.onTimeChange_());
		this.$('audio').addEventListener('ended', () => this.onEnd_());
		this.$('#volume-bar').addEventListener('progress-set', ({detail}) => this.onSetVolume_(detail));
		this.$('#time-bar').addEventListener('progress-set', ({detail}) => this.onSetTime_(detail));
		this.$('#pause').addEventListener('change', ({detail}) => this.onPauseToggle_(detail))
	}

	get src() {
		return this.getAttribute('src');
	}

	set src(value) {
		this.setAttribute('src', value);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'src')
			this.$('audio').src = path.resolve(songStorage.getSongDir(), newValue);
	}

	onVolumeChange_() {
		let {volume} = this.$('audio');
		this.$('#volume-bar').progress = volume;
		this.$('#volume-bar').preValue = Player.volumeFormat(volume);
	}

	onTimeChange_() {
		let {currentTime, duration} = this.$('audio');
		this.$('#time-bar').progress = currentTime / duration;
		this.$('#time-bar').preValue = Player.timeFormat(currentTime);
		this.$('#time-bar').postValue = Player.timeFormat(duration);
	}

	onEnd_() {
		this.dispatchEvent(new CustomEvent('end'));
	}

	onSetVolume_(volume) {
		volume = Math.round(volume * 20) / 20;

		const THRESHOLD = .15;
		if (volume < THRESHOLD)
			volume = 0;
		if (volume > 1 - THRESHOLD)
			volume = 1;

		this.$('audio').volume = volume;
	}

	onSetTime_(time) {
		this.$('audio').currentTime = time * this.$('audio').duration;
	}

	onPauseToggle_(play) {
		if (!play)
			this.$('audio').pause();
		else
			this.$('audio').play().catch(e => console.log('err playing', e));
	}

	static volumeFormat(volume) {
		return Player.num2str((volume * 100).toFixed(0), 2);
	}

	static timeFormat(seconds) {
		seconds = parseInt(seconds);
		let remainderSeconds = Player.num2str(seconds % 60, 2);
		let minutes = Player.num2str((seconds - remainderSeconds) / 60);
		return `${minutes}:${remainderSeconds}`;
	}

	static num2str(number, length) {
		return number.toString().padStart(length, 0);
	}
});
