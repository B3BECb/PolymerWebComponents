Builder
	.RegisterHtmlTemplate("Components/Elements/CheckBox.CheckBoxTemplate.html",
		(link) =>
		{
			MaterialCheckBox.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('material-check-box', MaterialCheckBox);
		});

class MaterialCheckBox extends HTMLElement
{
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

		this.InsertTemplate();
	}

	InsertTemplate()
	{
		var content = MaterialCheckBox.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));
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