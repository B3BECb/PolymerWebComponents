Builder
.RegisterHtmlTemplate("PolymerCheckBox/PolymerCheckBoxTemplate.html",
	(link) =>
	{
		MaterialCheckBox.Link = document.querySelector('#' + link.ReferenceName);

		window.customElements.define(MaterialCheckBox.is, MaterialCheckBox);
	});

class MaterialCheckBox
	extends Polymer.Element
{
	static get is()
	{
		return "material-check-box";
	}

	constructor()
	{
		super();

		this.checked = false;

		this.OnChecked = null;

		this.addEventListener("click", () =>
		{
			this.checked = !this.checked;
			if(this.OnChecked)
				this.OnChecked(this);
		});
	}

	get checked()
	{
		return this.hasAttribute("checked");
	}

	set checked(value)
	{
		if(value)
			this.setAttribute("checked", "");
		else
			this.removeAttribute("checked");
	}

	get disabledAnimation()
	{
		return this.hasAttribute("disabledAnimation");
	}

	set disabledAnimation(value)
	{
		if(value)
			this.setAttribute("disabledAnimation", "");
		else
			this.removeAttribute("disabledAnimation");
	}
}