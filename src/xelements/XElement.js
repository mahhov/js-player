class XElement extends HTMLElement {
	constructor(htmlString) {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.innerHTML = htmlString;
	}

	$(query) {
		return this.shadowRoot.querySelector(query);
	}

	$$(query) {
		return this.shadowRoot.querySelectorAll(query);
	}
}

module.exports = XElement;

// todo use template https://developers.google.com/web/fundamentals/web-components/examples/howto-checkbox ?