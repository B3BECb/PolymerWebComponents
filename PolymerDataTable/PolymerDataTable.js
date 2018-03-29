Builder
	.RegisterScript("CookieManager.js")
	.RegisterScript("ScriptLocalizer.js")
	.RegisterScript("PolymerItemList/PolymerItemList.js")
	.RegisterScript("PolymerDotsMenu/PolymerDotsMenu.js")
	.RegisterScript("PolymerComboBox/PolymerComboBox.js")
	.RegisterScript("PolymerDataTable/TableConfig.js")
	.RegisterHtmlTemplate("PolymerDataTable/PolymerDataTableTemplate.html",
		(link) =>
		{
			DataTable.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define(DataTable.is, DataTable);
		});

class DataTable
	extends Polymer.Element
{
	static get is()
	{
		return 'material-data-table';
	}

	constructor()
	{
		super();
	}

	ready()
	{
		super.ready();

		this.TableConfiguration = null;

		this.$.tableContainer.querySelector('.headerLine.caption')
			.textContent = Localizer
			.GetLocalizedString('Locale.Components.DataTable.Menu.Columns');

		let links            = this.$.tableContainer.querySelectorAll('.controlLink');
		links[0].textContent = Localizer
			.GetLocalizedString('Locale.Components.DataTable.Menu.SelectAll');
		links[1].textContent = Localizer
			.GetLocalizedString('Locale.Components.DataTable.Menu.ClearAll');

		this.$.tableContainer.querySelector('.button.blue .text')
			.textContent = Localizer
			.GetLocalizedString('Locale.Components.DataTable.Menu.Apply');
		this.$.tableContainer.querySelector('.button:not(.blue) .text')
			.textContent = Localizer
			.GetLocalizedString('Locale.Components.DataTable.Menu.Cancel');

		this.$.tableContainer.querySelector('.button.blue')
			.addEventListener('click',
				() =>
				{
					var uncheckedCollumns = this.$.tableContainer.querySelector('item-list')
						.GetUncheckedItems();

					var checkedCollumns = this.$.tableContainer.querySelector('item-list')
						.GetCheckedItems();

					checkedCollumns.forEach(
						(column) =>
						{
							var columnSettings       = this.TableConfiguration.Columns.find(
								x => x.Id == column.dataset.id);
							columnSettings.IsEnabled = true;

							this.$.tableContainer.querySelectorAll(`[data-column-id="${columnSettings.Id}"]`)
								.forEach(
									function(col)
									{
										col.removeAttribute('hidden');
									},
								);
						},
					);

					uncheckedCollumns.forEach(
						(column) =>
						{
							var columnSettings       = this.TableConfiguration.Columns.find(
								x => x.Id == column.dataset.id);
							columnSettings.IsEnabled = false;

							this.$.tableContainer.querySelectorAll(`[data-column-id="${columnSettings.Id}"]`)
								.forEach(
									function(col)
									{
										col.setAttribute('hidden', '');
									},
								);
						},
					);

					var tableConfigs = CookieManager.getCookie('TableConfigs', true);

					var cookieLife = new Date();
					cookieLife.setFullYear(cookieLife.getFullYear() + 1);
					cookieLife = {expires:cookieLife};

					if(uncheckedCollumns.length)
					{
						if(tableConfigs)
						{
							let thisTableConfig = tableConfigs.find(config => config.Id == this.id);
							if(thisTableConfig)
							{
								thisTableConfig.Hided = uncheckedCollumns.map(item => item.dataset.id);
							}
							else
								tableConfigs.push(
									new TableConfig(this.id, uncheckedCollumns.map(item => item.dataset.id)));

							CookieManager.deleteCookie('TableConfigs');
							CookieManager.setCookie('TableConfigs', tableConfigs, cookieLife);
						}
						else
						{
							CookieManager.setCookie('TableConfigs',
								[new TableConfig(this.id, uncheckedCollumns.map(item => item.dataset.id))], cookieLife);
						}
					}
					else
					{
						if(tableConfigs)
						{
							let thisTableConfig = tableConfigs.find(config => config.Id == this.id);
							if(thisTableConfig)
							{
								var index = tableConfigs.indexOf(thisTableConfig);
								tableConfigs.splice(index, 1);

								CookieManager.deleteCookie('TableConfigs');
								CookieManager.setCookie('TableConfigs', tableConfigs, cookieLife);
							}
						}
					}
				});

		this.$.tableContainer.querySelector('table')
			.addEventListener('click',
				(eventArgs) =>
					this.dispatchEvent(new CustomEvent('tableClicked', {detail: eventArgs.target})));

		this.$.tableContainer.querySelector('.cardHeader+div')
			.addEventListener('scroll',
				(eventArgs) => this.dispatchEvent(new CustomEvent('scroll',
					{
						detail: eventArgs.target,
					})));
	}

	AddRow(values)
	{
		var table = this.$.tableContainer.querySelector('table');

		var tr = document.createElement('tr');

		var that = this;
		tr.addEventListener('click',
			function()
			{
				if(!that.Multiselect)
				{
					var previos = this.parentElement.querySelector('tr[selected]');
					if(previos)
						previos.removeAttribute('selected');

					this.setAttribute('selected', '');
				}
				else
				{
					var checkBox     = this.querySelector('material-check-box');
					checkBox.checked = !this.hasAttribute('selected');

					if(this.hasAttribute('selected'))
					{
						this.removeAttribute('selected');
					}
					else
					{
						this.setAttribute('selected', '');
					}

					if(that.GetUncheckedItems().length)
						that.$.tableContainer.querySelector('table tr:first-child material-check-box').checked = false;
					else
						that.$.tableContainer.querySelector('table tr:first-child material-check-box').checked = true;

					if(that.GetCheckedItems().length)
					{
						that.RowSelected = true;
					}
					else
					{
						that.RowSelected = false;
					}
				}

				that.dispatchEvent(new CustomEvent('rowSelected', {detail: this}));
			});

		var td = document.createElement('td');

		if(this.Multiselect)
		{
			var checkBoxContainer = document.createElement('span');
			var checkBox          = document.createElement('material-check-box');

			checkBoxContainer.appendChild(checkBox);
			td.appendChild(checkBoxContainer);

			tr.appendChild(td);

			td = document.createElement('td');
		}

		var keyColumn = values.find(x => x.Id == this.TableConfiguration.Key.Id);
		if(keyColumn)
		{
			td.textContent = keyColumn.Value;
			tr.appendChild(td);
		}
		else
		{
			td.textContent = "";
			tr.appendChild(td);
		}

		this.TableConfiguration.Columns.forEach(
			(column) =>
			{
				td                  = document.createElement('td');
				td.dataset.columnId = column.Id;

				if(!column.IsEnabled)
					td.setAttribute('hidden', '');

				var columnData = values.find(x => x.Id == column.Id);
				if(columnData)
				{
					var columnValue = columnData.Value;
					if(column.ValueConvertor)
					{
						var converted = column.ValueConvertor(columnValue);

						if(typeof(converted) == "object")
							td.appendChild(converted);
						else
							td.textContent = converted;
					}
					else
						td.textContent = columnValue;
				}

				tr.appendChild(td);
			},
		);

		table.appendChild(tr);

		return tr;
	}

	Clear(clearAllTable)
	{
		if(clearAllTable)
		{
			this.$.tableContainer.querySelector('item-list')
				.Clear();

			this.$.tableContainer.querySelector('item-list').OnElementsStateChanged =
				(isAnychecked, obj) =>
				{
					if(isAnychecked)
						this.$.tableContainer.querySelectorAll('.controlLink')[1].removeAttribute('blocked');
					else
						this.$.tableContainer.querySelectorAll('.controlLink')[1].setAttribute('blocked', '');

					if(obj.GetUncheckedItems().length > 0)
					{
						this.$.tableContainer.querySelectorAll('.controlLink')[0].removeAttribute('blocked');
					}
					else
					{
						this.$.tableContainer.querySelectorAll('.controlLink')[0].setAttribute('blocked', '');
					}
				};

			var table = this.$.tableContainer.querySelector('table');
			while(table.rows.length > 0)
			{
				table.deleteRow(0);
			}
		}
		else
		{
			if(this.Multiselect)
			{
				this.$.tableContainer.querySelector('table tr:first-child material-check-box').checked = false;
				this.RowSelected                                                                 = false;
			}

			var table = this.$.tableContainer.querySelector('table');
			while(table.rows.length > 1)
			{
				table.deleteRow(1);
			}
		}
	}

	CheckAll()
	{
		if(!this.Multiselect)
			throw 'Table not in multiselect mode!';

		this.$.tableContainer.querySelector('table tr:first-child material-check-box').checked = true;
		this.$.tableContainer.querySelectorAll('table tr:not(:first-child)')
			.forEach(
				row =>
				{
					row.setAttribute('selected', '');
					row.querySelector('material-check-box').checked = true;
				},
			);
	}

	UncheckAll()
	{
		if(!this.Multiselect)
			throw 'Table not in multiselect mode!';

		this.$.tableContainer.querySelector('table tr:first-child material-check-box').checked = false;
		this.$.tableContainer.querySelectorAll('table tr:not(:first-child)')
			.forEach(
				row =>
				{
					row.removeAttribute('selected');
					row.querySelector('material-check-box').checked = false;
				},
			);
	}

	GetCheckedItems()
	{
		return this.$.tableContainer.querySelectorAll("table tr:not(:first-child)[selected]");
	}

	GetUncheckedItems()
	{
		return this.$.tableContainer.querySelectorAll("table tr:not(:first-child):not([selected])");
	}

	get Configuration()
	{
		return this.TableConfiguration;
	}

	set Configuration(value)
	{
		this.TableConfiguration = value;

		this.Clear(true);

		if(typeof(this.TableConfiguration.Title) == "object")
			this.$.tableContainer.querySelector('.cardHeader span')
				.appendChild(this.TableConfiguration.Title);
		else
			this.$.tableContainer.querySelector('.cardHeader span').textContent = this.TableConfiguration.Title;

		var table = this.$.tableContainer.querySelector('table');
		var list  = this.$.tableContainer.querySelector('item-list');

		var headerRow = document.createElement('tr');
		var th        = document.createElement('th');

		if(this.Multiselect)
		{
			var itemMenu = this.$.tableContainer.querySelector('dots-menu');

			if(this.TableConfiguration.DotsMenuOptions.length)
			{
				this.TableConfiguration.DotsMenuOptions.forEach(
					function(option)
					{
						if(option)
							itemMenu.AddItem(option.Text, option.CallBack, option.Type);
					},
				);
			}
			else
			{
				itemMenu.disabled = true;
			}

			var checkBoxContainer = document.createElement('span');
			var checkBox          = document.createElement('material-check-box');

			var that = this;
			checkBox.addEventListener('click',
				() =>
				{
					if(checkBox.checked)
					{
						that.CheckAll();
						that.RowSelected = true;
					}
					else
					{
						that.UncheckAll();
						that.RowSelected = false;
					}
				});

			checkBoxContainer.appendChild(checkBox);
			th.appendChild(checkBoxContainer);

			headerRow.appendChild(th);
			th = document.createElement('th');
		}

		th.textContent = this.TableConfiguration.Key.DisplayName;
		headerRow.appendChild(th);

		var tableCookieConfigs = CookieManager.getCookie('TableConfigs', true);

		var tableCookieConfig = tableCookieConfigs ? tableCookieConfigs.find(config => config.Id == this.id) : null;

		this.TableConfiguration.Columns.forEach((column) =>
		{
			var added = list.AddItem(column.DisplayName);
			var th    = document.createElement('th');

			column.IsEnabled = tableCookieConfig ? !tableCookieConfig.Hided.includes(column.Id.toString())
				: column.IsEnabled;

			added.dataset.id = column.Id;
			if(column.IsEnabled)
			{
				added.querySelector('material-check-box')
					.setAttribute('checked', '');
				added.dataset.itemChecked = true;
			}
			else
			{
				th.setAttribute('hidden', '');
			}

			th.dataset.columnId = column.Id;
			th.textContent      = column.DisplayName;
			headerRow.appendChild(th);
		});

		table.appendChild(headerRow);
	}

	get Multiselect()
	{
		return this.hasAttribute('multiselect');
	}

	set Multiselect(value)
	{
		if(value)
			this.setAttribute('multiselect', '');
		else
			this.removeAttribute('multiselect');
	}

	get RowSelected()
	{
		return this.hasAttribute('rowSelected');
	}

	set RowSelected(value)
	{
		if(value)
		{
			this.setAttribute('rowSelected', '');

			this.$.tableContainer.querySelector('.cardHeader span').textContent =
				Localizer.GetLocalizedString('Locale.Components.DataTable.RowsCountHeader',
					'item selected')
				+ ' '
				+ this.GetCheckedItems().length;
		}
		else
		{
			this.removeAttribute('rowSelected');

			if(typeof(this.TableConfiguration.Title) == "object")
				this.$.tableContainer.querySelector('.cardHeader span')
					.appendChild(this.TableConfiguration.Title);
			else
				this.$.tableContainer.querySelector(
					'.cardHeader span').textContent = this.TableConfiguration.Title;
		}
	}



	get Loading()
	{
		return this.hasAttribute('loading');
	}

	set Loading(value)
	{
		if(value)
			this.setAttribute('loading', '');
		else
			this.removeAttribute('loading');
	}

	get LoadError()
	{
		return this.hasAttribute('loadError');
	}

	set LoadError(value)
	{
		if(value)
			this.setAttribute('loadError', '');
		else
			this.removeAttribute('loadError');
	}
}

class TableConfiguration
{
	constructor(title, key, columns, dotsMenuOptions = [])
	{
		this.Title           = title;
		this.Key             = key;
		this.Columns         = columns;
		this.DotsMenuOptions = dotsMenuOptions;
	}
}

class TableColumn
{
	constructor(id, displayName, valueConvertor, isEnabled)
	{
		this.Id             = id;
		this.DisplayName    = displayName;
		this.ValueConvertor = valueConvertor;
		this.IsEnabled      = isEnabled;
	}
}

class TableValue
{
	constructor(columnId, value, dataset = null)
	{
		this.Id    = columnId;
		this.Value = value;
	}
}