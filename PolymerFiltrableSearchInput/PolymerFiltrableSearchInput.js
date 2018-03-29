Builder
.RegisterScript("ScriptLocalizer.js")
.RegisterHtmlTemplate("PolymerFiltrableSearchInput/PolymerFiltrableSearchInputTemplate.html",
	(link) =>
	{
		FiltrableSearchInput.Link = document.querySelector('#' + link.ReferenceName);

		window.customElements.define(FiltrableSearchInput.is, FiltrableSearchInput);
	});

class FiltrableSearchInput
	extends Polymer.Element
{
	static get is()
	{
		return "filtrable-search-input";
	}

	static get properties()
	{
		return {};
	}

	constructor()
	{
		super();
	}

	ready()
	{
		super.ready();

		var applyBtn = this.$.searchContainer.querySelector('.button.blue');
		var cancelBtn = this.$.searchContainer.querySelector('.button:not(.blue)');
		var input = this.$.searchContainer.querySelector('input');

		applyBtn.querySelector('.text').textContent = 'ПОИСК';
		Localizer.GetLocalizedString('Locale.Pages.Journal.Tabs.SearchTab.Buttons.Search');
		cancelBtn.querySelector('.text').textContent = 'ОТМЕНА';
		Localizer.GetLocalizedString('Locale.Pages.Journal.Tabs.SearchTab.Buttons.Cancel');
		input.setAttribute('placeholder', 'Поиск по журалу',
			Localizer.GetLocalizedString('Locale.Pages.Journal.Tabs.SearchTab.Title'));

		applyBtn.addEventListener('click', () => this.dispatchEvent(new CustomEvent("search")));
		this.$.searchContainer.querySelector('.icon')
			.addEventListener('click', () => this.dispatchEvent(new CustomEvent("search")));
		this.$.searchContainer.querySelector('.icon.reset')
			.addEventListener('click', () => this.dispatchEvent(new CustomEvent("filterReset")));

		var that = this;
		input.addEventListener('input', function()
		{
			that.dispatchEvent(new CustomEvent("valueChanged",
				{
					detail: this.value,
				}));
		});

	}

	Add(text, component)
	{
		var content = FiltrableSearchInput.Link.import.querySelector("template#item").content;

		this.$.searchContainer.querySelector('.filtersContent').appendChild(content.cloneNode(true));

		var item = this.$.searchContainer.querySelector('.filtersContent').querySelectorAll(".filterItem");
		item = item[item.length - 1];

		item.querySelector(".title").textContent = text;
		item.querySelector(".content").appendChild(component);

		return item;
	}

	get IsFilterActive()
	{
		return this.hasAttribute("filterActive");
	}

	set IsFilterActive(value)
	{
		if(value)
		{
			this.setAttribute("filterActive", "");
		}
		else
		{
			this.removeAttribute("filterActive");
		}
	}

	get FilterComponents()
	{
		return this.$.searchContainer.querySelector('.filtersContent').querySelectorAll(".content");
	}

	get Value()
	{
		return this.$.searchContainer.querySelector('input').value;
	}

	set Value(value)
	{
		this.$.searchContainer.querySelector('input').value = value;
	}
}