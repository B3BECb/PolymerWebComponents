Builder
.RegisterHtmlTemplate("PolymerMaterialSwitch/PolymerMaterialSwitchTemplate.html",
	(link) =>
	{
		MaterialSwitch.Link = document.querySelector('#' + link.ReferenceName);

		window.customElements.define(MaterialSwitch.is, MaterialSwitch);
	});

class MaterialSwitch
	extends Polymer.Element
{
	static get is()
	{
		return "material-switch";
	}

	constructor()
	{
		super();

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