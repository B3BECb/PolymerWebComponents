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

	static get properties()
	{
		return {
			items   : {
				value()
				{
					return [
						//{value: 123},
						//{value: 321},
						//{value: "abc"},
					];
				},
			},
			multiple:
				{
					type : Boolean,
					value: false,
				},
		};
	}

	/*connectedCallback(args)
	{
		super.connectedCallback();
		this._observer = new Polymer.FlattenedNodesObserver(this.$.test, function(info)
		{
			// info is {addedNodes: [...], removedNodes: [...]}
		});
	}*/

	async Add(value)
	{
		await new Promise((resolve, reject) =>
			{
				var aaa = (args) =>
				{
					this.$.test.removeEventListener('dom-change', aaa);
					resolve();
				};

				this.$.test.addEventListener('dom-change', aaa);

				var a = this.push('items', {value: value});
			}
		);

		//TODO: возвращать последний добавленный элемент
		return 123;
	}
}