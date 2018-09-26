Builder
	.RegisterScript("PolymerNotificationRing/PolymerNotificationLine.js")
	.RegisterHtmlTemplate("PolymerNotificationRing/PolymerNotificationRingTemplate.html",
		(link) =>
		{
			MaterialNotificationRing.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define(MaterialNotificationRing.is, MaterialNotificationRing);
		});

class MaterialNotificationRing
	extends Polymer.Element
{
	static get is()
	{
		return "material-notification-ring";
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

		this._BindCommands();
	}

	_BindCommands()
	{
		this.$.notificationRing
			.querySelector(".notificationRing .ring")
			.addEventListener("click", args =>
			{
				this._SwitchCollapsing(args);

				this.dispatchEvent(new CustomEvent("ringClicked",
					{
						detail: this,
					}));
			});

		this.$.notificationRing
			.querySelector(".notificationRing .notifications.control .header .settings")
			.addEventListener("click", args =>
			{
				this.IsSettingsOpened = !this.IsSettingsOpened;

				if(this.IsSettingsOpened)
				{
					this.dispatchEvent(new CustomEvent("settingsOpened",
						{
							detail: this,
						}));
				}
				else
				{
					this.dispatchEvent(new CustomEvent("settingsClosed",
						{
							detail: this,
						}));
				}
			});

		this.$.notificationRing
			.querySelector(".notificationRing .notifications.control .header .exit")
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
		if(args.target !== this)
		{
			this.IsCollapsed = !this.IsCollapsed;

			if(!this.IsCollapsed)
			{
				this.NewMessagesCount = 0;

				window.addEventListener("click", this.__switchCollapsingHandler);

				this.dispatchEvent(new CustomEvent("ringNotificationsExpanded",
					{
						detail: this,
					}));
			}
			else
			{
				this.IsSettingsOpened = false;

				window.removeEventListener("click", this.__switchCollapsingHandler);

				this.dispatchEvent(new CustomEvent("ringNotificationsCollapsed",
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
		return this.$.notificationRing.querySelector(".notificationRing .notifications.control .header .caption").textContent;
	}

	/**
	 * Устанавливает заголовок списка сообщений.
	 * @param {string} value - Заголовок;
	 */
	set Title(value)
	{
		this.$.notificationRing.querySelector(".notificationRing .notifications.control .header .caption").textContent = value;
	}

	/**
	 * Возвращает состояние списка сообщений.
	 * @return {boolean}
	 */
	get IsCollapsed()
	{
		return this.hasAttribute("collapsed");
	}

	/**
	 * Устанавливает состояние списка сообщений.
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
	 * Открыта ли страница настроек.
	 * @return {boolean}
	 */
	get IsSettingsOpened()
	{
		return this.hasAttribute("settingsPage");
	}

	/**
	 * Устанавливает состояние страницы настроек.
	 * @param {boolean} value - Состояние;
	 */
	set IsSettingsOpened(value)
	{
		if(value)
		{
			this.setAttribute("settingsPage", "");
		}
		else
		{
			this.removeAttribute("settingsPage");
		}
	}

	/**
	 * Возвращает количество новых сообщений.
	 * @return {Number}
	 */
	get NewMessagesCount()
	{
		return Number.parseInt(this.$.notificationRing.querySelector(".notificationRing .counter").textContent);
	}

	/**
	 * Устанавливает количество новых сообщений.
	 * @param {Number} value - Количество новых сообщений;
	 */
	set NewMessagesCount(value)
	{
		this.$.notificationRing.querySelector(".notificationRing .counter").textContent = value;

		if(value)
		{
			this.setAttribute("hasNewMessages", "");
		}
		else
		{
			this.removeAttribute("hasNewMessages");
		}
	}

	/**
	 * Возвращает список уведомлений.
	 * @return {Array<Node>}
	 */
	get NotificationLines()
	{
		return Array.from(this.$.notificationRing.querySelectorAll(".notificationRing .notificationsList.content *"));
	}

	/**
	 * Устанавливает содержимое страницы конфигурации.
	 * @param {NodeList<Node> || Array<Node>}configurationNodes
	 * @constructor
	 */
	set Configuration(configurationNodes)
	{
		let content = this.$.notificationRing.querySelector(".notificationRing .notifications.control .settingsList.content");

		this._RemoveAllChildNodes(content);

		if(configurationNodes.length)
		{
			this.setAttribute("configurable", "");

			configurationNodes.forEach(node =>
			{
				let container = document.createElement("div");

				container.classList.add("shadowed");
				container.classList.add("settingContainer");

				container.appendChild(node);
				content.appendChild(container);
			});
		}
		else
		{
			this.removeAttribute("configurable");
		}
	}

	/**
	 * Добавляет уведомление в список уведомлений.
	 * @param {string} title - заголовок уведомления;
	 * @param {string} message - сообщение уведомления;
	 * @param {Node | null} icon - иконка уведомления;
	 * @param {Date} dateTime - дата и время сообщения;
	 * @return {HTMLElement}
	 */
	AddNotification(title, message, dateTime = new Date(), icon = null)
	{
		let notificationLine = document.createElement("material-notification-line");

		this.$.notificationRing.querySelector(".notificationRing .notificationsList.content").appendChild(notificationLine);

		notificationLine.Title    = title;
		notificationLine.Message  = message;
		notificationLine.Icon     = icon || "";
		notificationLine.DateTime = dateTime;
		notificationLine.classList.add("shadowed");

		this.NewMessagesCount++;

		notificationLine.addEventListener("messageClosed", () =>
		{
			this.RemoveNotification(notificationLine);
		});

		return notificationLine;
	}

	/**
	 * Удаляет уведомление из списка уведомлений.
	 * @param {Node} notification - уведомление;
	 * @constructor
	 */
	RemoveNotification(notification)
	{
		let content = this.$.notificationRing.querySelector(".notificationRing .notificationsList.content");

		content.removeChild(notification);

		this.NewMessagesCount = 0;
	}

	/**
	 * Очищает список уведомлений.
	 */
	Clear()
	{
		let content = this.$.notificationRing.querySelector(".notificationRing .notificationsList.content");

		this._RemoveAllChildNodes(content);

		this.NewMessagesCount = 0;
	}

	_RemoveAllChildNodes(el)
	{
		while(el.children.length > 0)
		{
			el.removeChild(el.children[0]);
		}
	}
}