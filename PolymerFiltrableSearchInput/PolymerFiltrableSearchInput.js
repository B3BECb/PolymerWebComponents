Builder
.RegisterScript("ScriptLocalizer.js")
.RegisterHtmlTemplate("PolymerFiltrableSearchInput/PolymerFiltrableSearchInputTemplate.html",
	(link) =>
	{
		FiltrableSearchInput.Link = document.querySelector('#' + link.ReferenceName);

		window.customElements.define(FiltrableSearchInput.is, FiltrableSearchInput);
	});


class FiltrableSearchInput extends Polymer.Element
{
	static get is()
	{
		return "filtrable-search-input"
	}

	constructor()
	{
		super();
	}
}