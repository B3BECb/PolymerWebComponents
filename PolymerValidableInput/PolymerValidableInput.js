window.Builder
	  .RegisterHtmlTemplate("PolymerValidableInput/PolymerValidableInputTemplate.html",
		  (link) =>
		  {
			  ValidableInput.Link = document.querySelector('#' + link.ReferenceName);

			  window.customElements.define(ValidableInput.is, ValidableInput);
		  });

class ValidableInput
	extends Polymer.Element
{
	static get is()
	{
		return "validable-input";
	}

	constructor()
	{
		super();
	}

	static get properties()
	{
		return {
			title    : String,
			errorText: String,
			type     : String,
			value      : {
				type    : String,
				notify  : true,
				readOnly: false,
			},
		};
	}

	IsValueValid()
	{
		if(!this.validator)
		{
			return true;
		}

		var validationRusult = eval(this.validator);

		if(!validationRusult)
		{
			this.error = true;
		}
		else
		{
			this.error = false;
		}

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

	get error()
	{
		return this.hasAttribute("error");
	}

	set error(value)
	{
		if(value)
		{
			this.setAttribute("error", "");
		}
		else
		{
			this.removeAttribute("error");
		}
	}

	get noCollapse()
	{
		return this.hasAttribute("noCollapse");
	}

	set noCollapse(value)
	{
		if(value)
		{
			this.setAttribute("noCollapse", "");
		}
		else
		{
			this.removeAttribute("noCollapse");
		}
	}
}