window.Builder
	  .RegisterHtmlTemplate("PolymerDotsMenu/PolymerDotsMenuTemplate.html",
		  (link) =>
		  {
			  DotsMenu.Link = document.querySelector('#' + link.ReferenceName);

			  window.customElements.define(DotsMenu.is, DotsMenu);
		  });

class DotsMenu
	extends Polymer.Element
{
	static get is()
	{
		return "dots-menu";
	}

	constructor()
	{
		super();
	}

	static get properties()
	{
		return {
			settings : Boolean,
			disabled : Boolean,
			items : {
				value()
				{
					return [];
				},
			},
		};
	}

	_fireCallback(args)
	{
		if(args.currentTarget.callback)
			args.currentTarget.callback();
	}

	_OnCustomIconLoaded()
	{
		let iconContainer = Polymer.dom(this.root).querySelector('#customIcon' + (this.items.length - 1));
		iconContainer.appendChild(iconContainer.icon);
	}

	AddItem(value, callback = null, type = null)
	{
		let text = value;
		let icon;
		if(Array.isArray(value))
		{
			text = value[0];
			icon = value[1];
		}
		this.items.push(
			{
				value: text,
				callback: callback,
				type:
					{
						remove : type == "remove" ? true : false,
						edit : type == "edit" ? true : false,
						switchView : type == "switchView" ? true : false,
						custom : type == "custom" ? true : false,
					},
				icon: icon,
			}
		);

		let list = this.items;
		this.items = [];
		this.items = list;
	}
}