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

		var domItems = this.querySelectorAll("span");
		this.selectedValue = "";
		if(domItems)
		{
			domItems.forEach((s, index, array) =>
			{
				let selected = s.hasAttribute('selected');
				this.push('items', {
					selected: selected ? 'item selected' : 'item',
					value   : s.textContent,
					checked : selected ? true : false,
				});

				if(selected)
				{
					if(!this.hasAttribute('multiple'))
					{
						this.selectedValue = s.textContent;
					}
					else
					{
						this.selectedValue += s.textContent;
						if(index != array.length - 1)
						{
							this.selectedValue += ', ';
						}
					}
				}
			});

			while(this.firstChild)
			{
				this.removeChild(this.firstChild);
			}
		}
	}

	static get properties()
	{
		return {
			items        : {
				value()
				{
					return [];
				},
			},
			multiple     :
				{
					type : Boolean,
					value: false,
				},
			label        : String,
			selectedValue: String,
			placeholder  : String,
		};
	}

	_valueSelected(args)
	{
		let item = args.currentTarget;
		if(!this.multiple)
		{
			if(item.classList.contains('selected'))
			{
				return;
			}

			this.selectedValue = item.textContent;
			this.$.repeater.querySelectorAll(".item")
				.forEach(
					(currentItem) => currentItem.classList.remove('selected'),
				);
		}
		item.classList.toggle('selected');

		if(this.multiple)
		{
			var selected = this.$.repeater.querySelectorAll(".item.selected");
			if(selected.length)
			{
				this.selectedValue = "";
			}
			else
			{
				this.selectedValue = this.placeholder;
			}

			selected
			.forEach(
				(currentItem, index, array) =>
				{
					this.selectedValue += currentItem.children[1].textContent;
					if(index != array.length - 1)
					{
						this.selectedValue += ', ';
					}
				},
			);

			var cmbx = item.children[0].children[0];

			cmbx.checked = !cmbx.checked;
		}

		var eventArgs =
				{
					detail:
						{
							item         : item,
							itemIndex    : Number.parseInt(item.dataset.index),
							selectedItems: this.multiple ? this.SelectedItem : item,
						},
				};

		this.dispatchEvent(new CustomEvent("itemSelected", eventArgs));
	}

	async Add(value)
	{
		await new Promise((resolve, reject) =>
			{
				var waitEvent = (args) =>
				{
					this.$.repeater.removeEventListener('dom-change', waitEvent);
					resolve();
				};

				this.$.repeater.addEventListener('dom-change', waitEvent);

				this.push('items', {
					value   : value,
					selected: 'item',
				});
			},
		);

		let item = Polymer.dom(this.root).querySelectorAll('.item')[this.items.length - 1];

		return item;
	}

	Clear()
	{
		this.items = [];

		this.selectedValue = this.placeholder;
	}

	_SelectItem(index)
	{
		var items = this.$.repeater.querySelectorAll(".item");
		if(items.length < index)
		{
			throw 'Index out of range';
		}
		if(items[index].classList.contains('selected'))
		{
			return;
		}

		this.selectedValue = items[index].textContent;
		items
		.forEach(
			(currentItem) => currentItem.classList.remove('selected'),
		);
		items[index].classList.toggle('selected');
	}

	get Items()
	{
		return this.$.repeater.querySelectorAll(".item");
	}

	set Items(value)
	{
		throw "NotImplemented";
	}

	get SelectedItem()
	{
		if(this.multiple)
		{
			return this.$.repeater.querySelectorAll(".selected");
		}

		return this.$.repeater.querySelector(".selected");
	}

	set SelectedItem(index)
	{
		this._SelectItem(index);
	}

	get Multiple()
	{
		return this.multiple;
	}

	set Multiple(value)
	{
		if(value)
		{
			this.multiple = true;
		}
		else
		{
			this.multiple = false;
		}
	}

	get Placeholder()
	{
		return this.placeholder;
	}

	set Placeholder(value)
	{
		this.placeholder = value;
		this.selectedValue = value;
	}

	get Label()
	{
		return this.label;
	}

	set Label(value)
	{
		this.label = value;
	}

	get error()
	{
		return this.hasAttribute("error");
	}

	set error(value)
	{
		if(value)
		{
			this.setAttribute("error", "");
		}
		else
		{
			this.removeAttribute("error");
		}
	}
}