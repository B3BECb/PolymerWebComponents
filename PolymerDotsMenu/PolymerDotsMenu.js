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
				}
			}
		};
	}

	AddItem(value, callback = null, type = null)
	{
		this.items.push(
			{
				value: value,
				callback: callback,
				type:
					{
						remove : type == "remove" ? true : false,
						edit : type == "edit" ? true : false,
						switchView : type == "switchView" ? true : false,
						custom : type == "custom" ? true : false,
					}
			}
		);

		let list = this.items;
		this.items = [];
		this.items = list;
	}
}