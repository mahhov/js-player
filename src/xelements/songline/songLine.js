const template = require('fs').readFileSync(`${__dirname}/songLine.html`, 'utf8');
const XElement = require('../XElement');

customElements.define('x-song-line', class extends XElement {
		static get observedAttributes() {
			return ['number', 'title', 'favorited', 'selected'];
		}

		constructor() {
			super(template);
		}

		connectedCallback() {
			if (!this.hasAttribute('number'))
				this.setAttribute('number', 0);
			if (!this.hasAttribute('title'))
				this.setAttribute('title', '');

			this.$('#favorite').addEventListener('change', e => this.emitFavorite_(e));
			this.$('#remove').addEventListener('click', e => this.emitRemove_(e));
			this.$('#container').addEventListener('click', () => this.emitSelect_());
		}

		get number() {
			return this.getAttribute('number');
		}

		set number(value) {
			this.setAttribute('number', value);
		}

		get title() {
			return this.getAttribute('title');
		}

		set title(value) {
			this.setAttribute('title', value);
		}

		get favorited() {
			return this.hasAttribute('favorited');
		}

		set favorited(value) {
			if (value)
				this.setAttribute('favorited', '');
			else
				this.removeAttribute('favorited');
		}

		get selected() {
			return this.hasAttribute('selected');
		}

		set selected(value) {
			if (value)
				this.setAttribute('selected', '');
			else
				this.removeAttribute('selected');
		}

		get text() {
			return `${this.number} ${this.title}`;
		}

		attributeChangedCallback(name, oldValue, newValue) {
			switch (name) {
				case 'favorited':
					this.$('#favorite').checked = this.hasAttribute('favorited');
					break;
				case 'selected':
					this.$('#container').classList.toggle('selected', this.hasAttribute('selected'));
					break;
				default:
					this.$(`#${name}`).textContent = newValue;
			}
		}

		emitFavorite_(e) {
			this.favorited = this.$('#favorite').checked;
			this.dispatchEvent(new CustomEvent('favorite', {detail: this.$('#favorite').checked}));
		}

		emitRemove_(e) {
			e.stopPropagation(); // prevent emitSelect
			this.dispatchEvent(new CustomEvent('remove'));
		}

		emitSelect_() {
			this.dispatchEvent(new CustomEvent('select'));
			// todo not updating "i of n" text and favorite star
		}
	}
);
