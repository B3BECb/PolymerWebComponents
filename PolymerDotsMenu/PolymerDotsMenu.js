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

	ready()
	{
		super.ready();

		if(this.hasAttribute("settings"))
		{
			let icon = DotsMenu.Link.import.querySelector('template#settingsIcon').content;
			this.$.dotsContainer.appendChild(icon);
		}
		else
		{
			let icon = DotsMenu.Link.import.querySelector('template#dotsIcon').content;
			this.$.dotsContainer.appendChild(icon);
		}
	}

	AddItem(value, callback = null, type = null)
	{
		var content = DotsMenu.Link.import.querySelector("template#item").content;

		var menulist = this.$.menuList;
		menulist.appendChild(content.cloneNode(true));

		var item = menulist.querySelectorAll(".item");
		item     = item[item.length - 1];

		if(callback)
			item.addEventListener('click', callback);

		if(type)
		{
			var template = DotsMenu.Link.import.querySelector("template#" + type)
				.content;

			if(Array.isArray(value))
			{
				item.querySelector(".text").textContent = value[0];
				template.querySelector('span').appendChild(value[1]);
			}
			else
			{
				item.querySelector(".text").textContent = value;
			}

			item.querySelector(".icon")
				.appendChild(template.cloneNode(true));
		}
		else
		{
			item.querySelector(".text").textContent = value;
		}

		return item;
	}

	get disabled()
	{
		return this.hasAttribute("disabled");
	}

	set disabled(value)
	{
		if(value)
		{
			this.setAttribute("disabled", "");
		}
		else
		{
			this.removeAttribute("disabled");
		}
	}
}