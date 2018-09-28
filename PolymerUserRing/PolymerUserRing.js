Builder
	.RegisterHtmlTemplate("PolymerUserRing/PolymerUserRingTemplate.html",
		(link) =>
		{
			MaterialUserRing.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define(MaterialUserRing.is, MaterialUserRing);
		});

class MaterialUserRing
	extends Polymer.Element
{
	static get is()
	{
		return "material-user-ring";
	}

	constructor()
	{
		super();
	}

	ready()
	{
		super.ready();

		this.__switchCollapsingHandler = args => this._SwitchCollapsing(args);

		this.IsCollapsed = true;
		this.Title = "";

		this._BindCommands();
	}

	_BindCommands()
	{
		this.$.userRing
			.querySelector(".userRing .ring")
			.addEventListener("click", args =>
			{
				this._SwitchCollapsing(args);

				this.dispatchEvent(new CustomEvent("ringClicked",
					{
						detail: this,
					}));
			});

		this.$.userRing
			.querySelector(".userRing .profile.control .header .exit")
			.addEventListener("click", args =>
			{
				this._SwitchCollapsing(args);

				this.dispatchEvent(new CustomEvent("exitClicked",
					{
						detail: this,
					}));
			});
	}

	_SwitchCollapsing(args)
	{
		if(!this.contains(args.target))
		{
			this.IsCollapsed = !this.IsCollapsed;

			if(!this.IsCollapsed)
			{
				window.addEventListener("click", this.__switchCollapsingHandler);

				this.dispatchEvent(new CustomEvent("userRingExpanded",
					{
						detail: this,
					}));
			}
			else
			{
				window.removeEventListener("click", this.__switchCollapsingHandler);

				this.dispatchEvent(new CustomEvent("userRingCollapsed",
					{
						detail: this,
					}));
			}
		}
	}

	/**
	 * Возвращает заголовок списка сообщений.
	 * @return {string}
	 */
	get Title()
	{
		return this.$.userRing.querySelector(".userRing .profile.control .header .caption").textContent;
	}

	/**
	 * Устанавливает заголовок списка сообщений.
	 * @param {string} value - Заголовок;
	 */
	set Title(value)
	{
		this.$.userRing.querySelector(".userRing .profile.control .header .caption").textContent = value;
	}

	/**
	 * Возвращает состояние панели.
	 * @return {boolean}
	 */
	get IsCollapsed()
	{
		return this.hasAttribute("collapsed");
	}

	/**
	 * Устанавливает состояние панели.
	 * @param {boolean} value - Состояние;
	 */
	set IsCollapsed(value)
	{
		if(value)
		{
			this.setAttribute("collapsed", "");
		}
		else
		{
			this.removeAttribute("collapsed");
		}
	}

	/**
	 * Возвращает состояние заголовка.
	 * @return {boolean}
	 */
	get IsHeadless()
	{
		return this.hasAttribute("headless");
	}

	/**
	 * Устанавливает состояние заголовка.
	 * @param {boolean} value - Состояние;
	 */
	set IsHeadless(value)
	{
		if(value)
		{
			this.setAttribute("headless", "");
		}
		else
		{
			this.removeAttribute("headless");
		}
	}
}