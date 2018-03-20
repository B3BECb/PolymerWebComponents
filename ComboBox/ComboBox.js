Builder
	.RegisterHtmlTemplate("Components/Elements/ComboBox.ComboBoxTemplate.html",
		(link) =>
		{
			MaterialComboBox.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('material-combo-box', MaterialComboBox);
		})
	.RegisterScript("Components/Elements/CheckBox.CheckBox.js");

class MaterialComboBox extends HTMLElement
{
	constructor()
	{
		super();

		this.InsertTemplate();
	}

	InsertTemplate()
	{
		var content = MaterialComboBox.Link.import.querySelector('template#main').content;

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

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));

		this.shadowRoot.querySelector(
			".selectedValue").textContent = this.Placeholder;
		this.shadowRoot.querySelector(
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

		this.shadowRoot.querySelector(".values")
			.appendChild(content.cloneNode(true));

		var item      = this.shadowRoot.querySelectorAll(".item");
		var itemIndex = item.length - 1;
		item          = item[itemIndex];

		item.addEventListener('click', () =>
		{
			var selectedValue = this.shadowRoot.querySelector(
				".selectedValue");

			if(!this.Multiple)
			{
				if(item.classList.contains('selected'))
					return;

				selectedValue.textContent = item.textContent;
				this.shadowRoot.querySelectorAll(".item")
					.forEach(
						(currentItem) => currentItem.classList.remove('selected'),
					);
			}
			item.classList.toggle('selected');

			if(this.Multiple)
			{
				var selected = this.shadowRoot.querySelectorAll(".item.selected");
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
		var values = this.shadowRoot.querySelector(".values");

		if(!values.firstChild) return;

		while(values.firstChild)
		{
			values.removeChild(values.firstChild);
		}

		this.shadowRoot.querySelector(".selectedValue").textContent = this.Placeholder;
	}

	_SelectItem(index)
	{
		var items = this.shadowRoot.querySelectorAll(".item");
		if(items.length < index)
			throw 'Index out of range';
		if(items[index].classList.contains('selected'))
			return;

		this.shadowRoot.querySelector(".selectedValue").textContent = items[index].textContent;
		items
			.forEach(
				(currentItem) => currentItem.classList.remove('selected'),
			);
		items[index].classList.toggle('selected');
	}

	get Items()
	{
		return this.shadowRoot.querySelectorAll(".item");
	}

	set Items(value)
	{
		throw "NotImplemented";
	}

	get SelectedItem()
	{
		if(this.Multiple)
			return this.shadowRoot.querySelectorAll(".selected");

		return this.shadowRoot.querySelector(".selected");
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
		this.shadowRoot.querySelector(
			".selectedValue").textContent = value;
	}

	get Label()
	{
		return this.getAttribute("label");
	}

	set Label(value)
	{
		this.setAttribute("label", value);
		this.shadowRoot.querySelector(
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