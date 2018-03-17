Builder
	.RegisterHtmlTemplate("ValidableInput/ValidableInputTemplate.html",
		(link) =>
		{
			ValidableInput.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('validable-input', ValidableInput);
		});

class ValidableInput extends HTMLElement
{
	constructor()
	{
		super();

		this.error = false;

		this.InsertTemplate();
	}

	InsertTemplate()
	{
		var content = ValidableInput.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));

		this.shadowRoot.querySelector(".label").textContent = this.title;
		this.shadowRoot.querySelector(".error").textContent = this.errorText;
		this.shadowRoot.querySelector("input").type         = this.type;

		this.addEventListener("input", () =>
		{
			this.IsValueValid();

			this.dispatchEvent(new CustomEvent("valueChanged",
				{
					detail: this.value,
				}));
		});
	}

	IsValueValid()
	{
		if(!this.validator)
			return true;

		var validationRusult = eval(this.validator);

		if(!validationRusult)
			this.error = true;
		else
			this.error = false;

		return validationRusult;
	}

	get validator()
	{
		return this.getAttribute("validator");
	}

	set validator(value)
	{
		this.setAttribute("validator", value);
	}

	get value()
	{
		return this.shadowRoot.querySelector("input").value;
	}

	set value(value)
	{
		this.shadowRoot.querySelector("input").value = value;
		this.setAttribute("value", value);

		this.shadowRoot.querySelector(".label")
			.onclick();
		this.shadowRoot.querySelector("input")
			.oninput();
	}

	get title()
	{
		return this.getAttribute("title");
	}

	set title(value)
	{
		this.shadowRoot.querySelector(".label").textContent = value;
		this.setAttribute("title", value);
	}

	get errorText()
	{
		return this.getAttribute("errorText");
	}

	set errorText(value)
	{
		this.shadowRoot.querySelector(".error").textContent = value;
		this.setAttribute("errorText", value);
	}

	get error()
	{
		return this.hasAttribute("error");
	}

	set error(value)
	{
		if(value)
			this.setAttribute("error", "");
		else
			this.removeAttribute("error");
	}

	get noCollapse()
	{
		return this.hasAttribute("noCollapse");
	}

	set noCollapse(value)
	{
		if(value)
			this.setAttribute("noCollapse", "");
		else
			this.removeAttribute("noCollapse");
	}

	get type()
	{
		return this.getAttribute("type");
	}

	set type(value)
	{
		if(value)
		{
			if(value == "text" || value == "password")
			{
				this.setAttribute("type", value);
				this.shadowRoot.querySelector("input").type = this.type;
			}
			else
				console.warn("Incorrect validable input type");
		}
		else
		{
			this.removeAttribute("type");
			this.shadowRoot.querySelector("input").type = this.type;
		}
	}
}