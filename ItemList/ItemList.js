Builder
	.RegisterHtmlTemplate("Components/Elements/ItemList.ItemListTemplate.html",
		(link) =>
		{
			ItemList.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('item-list', ItemList);
		})
	.RegisterScript("Components/Elements/CheckBox.CheckBox.js")
	.RegisterScript("Components/Elements/DotsMenu.DotsMenu.js");

class ItemList extends HTMLElement
{
	constructor()
	{
		super();

		this.OnElementsStateChanged = null;

		this.InsertTemplate();
	}

	InsertTemplate()
	{
		var content = ItemList.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));
	}

	AddItem(text, menuOptions)
	{
		var content = ItemList.Link.import.querySelector("template#item").content;

		content.querySelector(".text").textContent = text;

		var itemsList = this.shadowRoot.querySelector('.items');

		itemsList.appendChild(content.cloneNode(true));

		var item = itemsList.querySelectorAll(".item");
		item     = item[item.length - 1];

		if(!this.uncheckable)
			item.querySelector("material-check-box").OnChecked = (element) =>
			{
				item.dataset.itemChecked = element.checked;
				this.IsAnyElementChecked();
			};
		else
			item.querySelector(".icon").style.display = 'none';

		var itemMenu = item.querySelector("dots-menu");

		if(menuOptions)
		{
			if(menuOptions.length)
				menuOptions.forEach(
					function(option)
					{
						if(option)
							itemMenu.AddItem(option.Text, option.CallBack, option.Type);
					},
				);
			else
				itemMenu.disabled = true;
		}
		else
		{
			var parent = itemMenu.parentNode;
			parent.parentNode.removeChild(parent);
		}

		return item;
	}

	CheckAll()
	{
		this.shadowRoot.querySelectorAll(".item")
			.forEach(
				function(item)
				{
					item.dataset.itemChecked = 'true';
					var checked              = item.querySelectorAll("material-check-box:not([checked])");

					checked.forEach(
						(element) =>
						{
							element.setAttribute('checked', '');
						},
					);
				},
			);
		if(this.OnElementsStateChanged) this.OnElementsStateChanged(true, this);
	}

	UncheckAll()
	{
		this.shadowRoot.querySelectorAll(".item")
			.forEach(
				function(item)
				{
					item.dataset.itemChecked = 'false';
					var checked              = item.querySelectorAll("material-check-box[checked]");

					checked.forEach(
						(element) =>
						{
							element.removeAttribute('checked');
						},
					);
				},
			);
		if(this.OnElementsStateChanged) this.OnElementsStateChanged(false, this);
	}

	GetCheckedItems()
	{
		var items = [];
		this.shadowRoot.querySelectorAll(".item")
			.forEach(
				function(item)
				{
					if(item.querySelector("material-check-box[checked]"))
						items.push(item);
				},
			);

		return items;
	}

	GetUncheckedItems()
	{
		var items = [];
		this.shadowRoot.querySelectorAll(".item")
			.forEach(
				function(item)
				{
					if(item.querySelector("material-check-box:not([checked])"))
						items.push(item);
				},
			);

		return items;
	}

	IsAnyElementChecked()
	{
		var anyChecked = false;
		this.shadowRoot.querySelectorAll(".item")
			.forEach(
				function(element)
				{
					if(anyChecked) return;

					if(element.dataset.itemChecked === "true")
						anyChecked = true;
				},
			);
		if(this.OnElementsStateChanged) this.OnElementsStateChanged(anyChecked, this);
	}

	Clear()
	{
		this.shadowRoot.querySelectorAll(".item")
			.forEach(
				function(element)
				{
					element.parentNode.removeChild(element);
				},
			);
	}

	get uncheckable()
	{
		return this.hasAttribute("uncheckable");
	}

	set uncheckable(value)
	{
		if(value)
			this.setAttribute("uncheckable", "");
		else
			this.removeAttribute("uncheckable");
	}
}