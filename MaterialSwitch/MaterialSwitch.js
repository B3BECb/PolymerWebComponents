Builder
	.RegisterHtmlTemplate("Components/Elements/MaterialSwitch.MaterialSwitchTemplate.html",
		(link) =>
		{
			MaterialSwitch.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('material-switch', MaterialSwitch);
		});

class MaterialSwitch extends HTMLElement
{
	constructor()
	{
		super();

		this.InsertTemplate();
	}

	InsertTemplate()
	{
		var content = MaterialSwitch.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));

		var that = this;
		this.addEventListener('click',
			() =>
			{
				that.checked = !that.checked;
				that.dispatchEvent(new CustomEvent("valueChanged",
					{
						detail: that.checked,
					}));
			});

		// Vivaldi browser hack
		this.removeAttribute("data-vivaldi-spatnav-clickable");
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
}