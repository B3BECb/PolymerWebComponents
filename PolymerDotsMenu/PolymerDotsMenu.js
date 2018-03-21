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
			settings: Boolean,
			disabled: Boolean,
			items:    {
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
		{
			args.currentTarget.callback();
		}
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
		/*this.items.push(
			{
				value:    text,
				callback: callback,
				type:
						  {
							  remove:     type == "remove" ? true : false,
							  edit:       type == "edit" ? true : false,
							  switchView: type == "switchView" ? true : false,
							  custom:     type == "custom" ? true : false,
						  },
				icon:     icon,
			},
		);

		let list = this.items;
		this.items = [];
		this.items = list;*/

		let getInsertedItem = async() =>
		{
			await
				new Promise((resolve, reject) =>
					{
						var waitEvent = (args) =>
						{
							this.$.repeater.removeEventListener('dom-change', waitEvent);
							resolve();
						};

						this.$.repeater.addEventListener('dom-change', waitEvent);

						this.push('items', {
							value:    text,
							callback: callback,
							type:
									  {
										  remove:     type == "remove" ? true : false,
										  edit:       type == "edit" ? true : false,
										  switchView: type == "switchView" ? true : false,
										  custom:     type == "custom" ? true : false,
									  },
							icon:     icon,
						});
					},
				);

			return Polymer.dom(this.root).querySelector('#customIcon' + (this.items.length - 1));
		};

		let aa = Promise.all([getInsertedItem()]);

		return aa.then(
			(item) =>
			{
				item.appendChild(item.icon);

				return Polymer.dom(this.root).querySelector('#item' + (this.items.length - 1))
			}
		);

	}
}