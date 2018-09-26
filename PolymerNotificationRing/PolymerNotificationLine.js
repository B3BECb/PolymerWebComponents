Builder
	.RegisterHtmlTemplate("PolymerNotificationRing/PolymerNotificationLineTemplate.html",
		(link) =>
		{
			MaterialNotificationLine.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define(MaterialNotificationLine.is, MaterialNotificationLine);
		});

class MaterialNotificationLine
	extends Polymer.Element
{
	static get is()
	{
		return "material-notification-line";
	}

	constructor()
	{
		super();
	}

	ready()
	{
		super.ready();

		this._id = null;

		this._BindCommands();

		this.IsCollapsed = true;
	}

	_BindCommands()
	{
		this.$.notificationMessage.querySelector(".content .close").addEventListener("click",
			(args) =>
			{
				this.dispatchEvent(new CustomEvent("messageClosed",
					{
						detail: this,
					}));
			});

		this.$.notificationMessage.querySelector(".collapsBtnBackground").addEventListener("click",
			(args) =>
			{
				this.IsCollapsed = true;
				this.dispatchEvent(new CustomEvent("messageCollapsed",
					{
						detail: this,
					}));
			});

		this.$.notificationMessage.querySelector(".content .text").addEventListener("click",
			(args) =>
			{
				if(this.IsCollapsed)
				{
					this.IsCollapsed = false;
					this.dispatchEvent(new CustomEvent("messageExpanded",
						{
							detail: this,
						}));
				}
			});
	}

	/**
	 * Возвращает состояние сообщения.
	 * @return {boolean}
	 */
	get IsCollapsed()
	{
		return this.hasAttribute("collapsed");
	}

	/**
	 * Устанавливает состояние сообщения.
	 * @param {boolean} value - Состояние;
	 * @constructor
	 */
	set IsCollapsed(value)
	{
		if(value)
			this.setAttribute("collapsed", "");
		else
			this.removeAttribute("collapsed");
	}

	/**
	 * Возвращает заголовок сообщения.
	 * @return {string}
	 * @constructor
	 */
	get Title()
	{
		return this.$.notificationMessage.querySelector(".content .header").textContent;
	}

	/**
	 * Устанавливает заголовок сообщения.
	 * @param {string} value
	 * @constructor
	 */
	set Title(value)
	{
		this.$.notificationMessage.querySelector(".content .header").textContent = value;
		this.$.notificationMessage.title = value;
	}

	/**
	 * Возвращает тело сообщения.
	 * @return {string}
	 */
	get Message()
	{
		return this.$.notificationMessage.querySelector(".content .text").textContent;
	}

	/**
	 * Устанавливает тело сообщения.
	 * @param {string} value
	 * @constructor
	 */
	set Message(value)
	{
		this.$.notificationMessage.querySelector(".content .text").textContent = value;
	}

	/**
	 * Возвращает дату и время сообщения.
	 * @return {string}
	 */
	get DateTime()
	{
		return this.$.notificationMessage.querySelector(".content .time").textContent;
	}

	/**
	 * Устанавливает дату и время сообщения.
	 * @param {Date} value
	 */
	set DateTime(value)
	{
		let full = num =>
		{
			if(num < 10)
			{
				return '0' + num;
			}

			return num;
		};

		let day     = full(value.getDate());
		let month   = full(value.getMonth() + 1);
		let hours   = full(value.getHours());
		let minutes = full(value.getMinutes());
		let seconds = full(value.getSeconds());

		let date = `${day}.${month}.${value.getFullYear()} ${hours}:${minutes}:${seconds}`;

		this.$.notificationMessage.querySelector(".content .time").textContent = date;
	}

	/**
	 * Возвращает иконку сообщения. Ссылка на изображение или объект.
	 * @return {string || Node}
	 */
	get Icon()
	{
		let iconBlock =  this.$.notificationMessage.querySelector(".icon");

		//TODO: if icon == "" or null, hide icon block
		if(iconBlock.firstChild)
		{
			return iconBlock.firstChild;
		}
		else
		{
			return iconBlock.style.backgroundImage;
		}
	}

	/**
	 * Устанавливает иконку сообщения. Ссылка на изображение или объект.
	 * @param {string || Node} value
	 */
	set Icon(value)
	{
		if(typeof value === "string")
		{
			this.$.notificationMessage.querySelector(".icon").style.backgroundImage = value;
		}
		else
		{
			this.$.notificationMessage.querySelector(".icon").appendChild(value);
		}
	}

	/**
	 * Возвращает идентификатор сообщения.
	 * @return {null || number}
	 * @constructor
	 */
	get Id()
	{
		return this._id;
	}

	/**
	 * Устанавливает идентификатор сообщения.
	 * @param {number} value
	 * @constructor
	 */
	set Id(value)
	{
		this._id = value;
	}
}