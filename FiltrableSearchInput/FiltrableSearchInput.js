Builder
	.RegisterScript("js/ScriptLocalizer.js")
	.RegisterHtmlTemplate("Components/Elements/FiltrableSearchInput.FiltrableSearchInputTemplate.html",
		(link) =>
		{
			FiltrableSearchInput.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('filtrable-search-input', FiltrableSearchInput);
		});

class FiltrableSearchInput extends HTMLElement
{
	constructor()
	{
		super();

		this.InsertTemplate();
	}

	InsertTemplate()
	{
		var content = FiltrableSearchInput.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));

		var applyBtn = this.shadowRoot.querySelector('.button.blue');
		var cancelBtn = this.shadowRoot.querySelector('.button:not(.blue)');
		var input = this.shadowRoot.querySelector('input');

		applyBtn.querySelector('.text').textContent = Localizer.GetLocalizedString('Locale.Pages.Journal.Tabs.SearchTab.Buttons.Search');
		cancelBtn.querySelector('.text').textContent = Localizer.GetLocalizedString('Locale.Pages.Journal.Tabs.SearchTab.Buttons.Cancel');
		input.setAttribute('placeholder', Localizer.GetLocalizedString('Locale.Pages.Journal.Tabs.SearchTab.Title'));

		applyBtn.addEventListener('click', () => this.dispatchEvent(new CustomEvent("search")));
		this.shadowRoot.querySelector('.icon').addEventListener('click', () => this.dispatchEvent(new CustomEvent("search")));
		this.shadowRoot.querySelector('.icon.reset').addEventListener('click', () => this.dispatchEvent(new CustomEvent("filterReset")));

		var that = this;
		input.addEventListener('input', function()
		{
			that.dispatchEvent(new CustomEvent("valueChanged",
				{
					detail:this.value
				}))
		});
	}

	Add(text, component)
	{
		var content = FiltrableSearchInput.Link.import.querySelector("template#item").content;

		this.shadowRoot.querySelector('.filtersContent').appendChild(content.cloneNode(true));

		var item = this.shadowRoot.querySelector('.filtersContent').querySelectorAll(".filterItem");
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
			this.setAttribute("filterActive", "");
		else
			this.removeAttribute("filterActive");
	}

	get FilterComponents()
	{
		return this.shadowRoot.querySelector('.filtersContent').querySelectorAll(".content");
	}

	get Value()
	{
		return this.shadowRoot.querySelector('input').value;
	}

	set Value(value)
	{
		this.shadowRoot.querySelector('input').value = value;
	}
}