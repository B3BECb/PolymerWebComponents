Builder
	.RegisterHtmlTemplate("PolymerPageLoading/PolymerPageLoadingTemplate.html", (link) =>
	{
		PolymerPageLoading.Link = document.querySelector('#' + link.ReferenceName);
		window.customElements.define(PolymerPageLoading.is, PolymerPageLoading);
	});

class PolymerPageLoading
	extends Polymer.Element
{
	static get is()
	{
		return "md-page-loading";
	}

	set Value(value)
	{
		this._percente.innerText = value.toString();
	}

	get Value()
	{
		return Number.parseInt(this._percente.innerText);
	}

	constructor()
	{
		super();
	}

	ready()
	{
		super.ready();
		this._BindCommands();
	}

	_BindCommands()
	{
		this._container = this.$.pageLoading;
		this._loader    = this._container.querySelector(".circle.loader");
		this._percente  = this._container.querySelector(".percent .value");
		this._loader.addEventListener('click', () =>
		{
			if(this._container.classList.contains('error'))
			{
				this.ChangeState(PageLoaderStates.None);
				this.dispatchEvent(new CustomEvent('cancel'));
			}
		});
		this.Value = 0;
	}

	ChangeState(status)
	{
		switch(status)
		{
			case PageLoaderStates.None:
				this._container.classList.remove("error");
				this._container.classList.add("hidden");
				this.Value = 0;
				break;
			case PageLoaderStates.Loading:
				this._container.classList.remove("error");
				this._container.classList.remove("hidden");
				break;
			case PageLoaderStates.Error:
				this._container.classList.add("error");
				this._container.classList.remove("hidden");
				break;
		}
	}
}

var PageLoaderStates;
(function(PageLoaderStates)
{
	PageLoaderStates[PageLoaderStates["None"] = 0] = "None";
	PageLoaderStates[PageLoaderStates["Loading"] = 1] = "Loading";
	PageLoaderStates[PageLoaderStates["Error"] = 2] = "Error";
})(PageLoaderStates || (PageLoaderStates = {}));
