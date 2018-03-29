window.Builder
	  .RegisterHtmlTemplate("PolymerComboBox/PolymerComboBoxTemplate.html",
		  (link) =>
		  {
			  MaterialComboBox.Link = document.querySelector('#' + link.ReferenceName);

			  window.customElements.define(MaterialComboBox.is, MaterialComboBox);
		  })
	  .RegisterScript("PolymerCheckBox/PolymerCheckBox.js");

class MaterialComboBox
	extends Polymer.Element
{
	static get is()
	{
		return "material-combo-box";
	}

	constructor()
	{
		super();
	}

	ready()
	{
		super.ready();

		var domItems = this.querySelectorAll("span");
		var items    = [];
		if(domItems)
		{
			domItems.forEach(s =>
			{
				items.push({
					selected: s.hasAttribute('selected'),
					text:     s.textContent,
				});
			});

			while(this.firstChild)
			{
				this.removeChild(this.firstChild);
			}
		}

		this.$.contentRoot.querySelector(
			".selectedValue").textContent = this.Placeholder;
		this.$.contentRoot.querySelector(
			".label").textContent         = this.Label;

		if(items.length)
			items.forEach(
				(element, index) =>
				{
					var added     = this.Add(element.text);
					if(element.selected)
						this._SelectItem(index);
				},
			);
	}
	
	Add(text)
	{
		var content = null;
		if(this.Multiple)
		{
			content                                              = MaterialComboBox.Link.import.querySelector(
				"template#multipleItem").content;
			content.querySelector("div").children[1].textContent = text;
		}
		else
		{
			content                                  = MaterialComboBox.Link.import.querySelector(
				"template#item").content;
			content.querySelector("div").textContent = text;
		}

		this.$.contentRoot.querySelector(".values")
			.appendChild(content.cloneNode(true));

		var item      = this.$.contentRoot.querySelectorAll(".item");
		var itemIndex = item.length - 1;
		item          = item[itemIndex];

		item.addEventListener('click', () =>
		{
			var selectedValue = this.$.contentRoot.querySelector(
				".selectedValue");

			if(!this.Multiple)
			{
				if(item.classList.contains('selected'))
					return;

				selectedValue.textContent = item.textContent;
				this.$.contentRoot.querySelectorAll(".item")
					.forEach(
						(currentItem) => currentItem.classList.remove('selected'),
					);
			}
			item.classList.toggle('selected');

			if(this.Multiple)
			{
				var selected = this.$.contentRoot.querySelectorAll(".item.selected");
				if(selected.length)
					selectedValue.textContent = "";
				else
					selectedValue.textContent = this.Placeholder;

				selected
				.forEach(
					(currentItem, index, array) =>
					{
						selectedValue.textContent += currentItem.children[1].textContent;
						if(index != array.length - 1)
							selectedValue.textContent += ', ';
					},
				);

				var cmbx = item.children[0].children[0];

				cmbx.checked = !cmbx.checked;
			}

			var eventArgs =
					{
						detail:
							{
								item:          item,
								itemIndex:     itemIndex,
								selectedItems: this.Multiple ? this.SelectedItem : item,
							},
					};

			this.dispatchEvent(new CustomEvent("itemSelected", eventArgs));
		});

		return item;
	}

	Clear()
	{
		var values = this.$.contentRoot.querySelector(".values");

		if(!values.firstChild) return;

		while(values.firstChild)
		{
			values.removeChild(values.firstChild);
		}

		this.$.contentRoot.querySelector(".selectedValue").textContent = this.Placeholder;
	}

	_SelectItem(index)
	{
		var items = this.$.contentRoot.querySelectorAll(".item");
		if(items.length < index)
			throw 'Index out of range';
		if(items[index].classList.contains('selected'))
			return;

		this.$.contentRoot.querySelector(".selectedValue").textContent = items[index].textContent;
		items
		.forEach(
			(currentItem) => currentItem.classList.remove('selected'),
		);
		items[index].classList.toggle('selected');
	}

	get Items()
	{
		return this.$.contentRoot.querySelectorAll(".item");
	}

	set Items(value)
	{
		throw "NotImplemented";
	}

	get SelectedItem()
	{
		if(this.Multiple)
			return this.$.contentRoot.querySelectorAll(".selected");

		return this.$.contentRoot.querySelector(".selected");
	}

	set SelectedItem(index)
	{
		this._SelectItem(index);
	}

	get Multiple()
	{
		return this.hasAttribute("multiple");
	}

	set Multiple(value)
	{
		if(value)
			this.setAttribute("multiple", "");
		else
			this.removeAttribute("multiple");
	}

	get Placeholder()
	{
		return this.getAttribute("placeholder");
	}

	set Placeholder(value)
	{
		this.setAttribute("placeholder", value);
		this.$.contentRoot.querySelector(
			".selectedValue").textContent = value;
	}

	get Label()
	{
		return this.getAttribute("label");
	}

	set Label(value)
	{
		this.setAttribute("label", value);
		this.$.contentRoot.querySelector(
			".label").textContent = value;
	}

	get error()
	{
		return this.hasAttribute("error");
	}

	set error(value)
	{
		if(value)
			this.setAttribute("error", "");
		else
			this.removeAttribute("error");
	}
}