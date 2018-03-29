Builder
.RegisterHtmlTemplate("Components/Elements/Videoplayer.VideoplayerTemplate.html",
	(link) =>
	{
		Videoplayer.Link = document.querySelector('#' + link.ReferenceName);

		window.customElements.define('video-player', Videoplayer);
	});

class Videoplayer
	extends HTMLElement
{
	constructor()
	{
		super();

		this.InsertTemplate();

		this._configuration = null;

		this._isPlayerStarted = false;
	}

	InsertTemplate()
	{
		var content = Videoplayer.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));

		this._BindCommands();
	}

	Configure(configuration)
	{
		if(this._configuration)
		{
			throw 'Player already configured';
		}

		var ConfigureTriggers = () =>
		{
			var triggers = this.shadowRoot.querySelector('.playerLayersContainer .video.layer .triggers');

			configuration.Triggers.forEach(
				(trigger) =>
				{
					let triggerNode = Videoplayer.Link.import.querySelector('template#trigger').content.cloneNode(true);
					triggerNode.querySelector('.text').textContent = trigger.TriggerName;
					let button = triggerNode.querySelector('.trigger.button');
					button.dataset.Id = trigger.TriggerId;
					button.addEventListener('click',
						() =>
						{
							this.dispatchEvent(new CustomEvent("triggerActivated",
								{
									detail: trigger,
								}));
						});
					triggers.appendChild(triggerNode);
				},
			);
		};

		let settingsBtn = this.shadowRoot.querySelector('#SettingsBtn');
		let recognitionBtn = this.shadowRoot.querySelector('#ManualRecognitionBtn');
		let ConfigureLayers = () =>
		{
			let ConfigureLayerName = (name, layerName) =>
			{
				let layerNameNode = this.shadowRoot.querySelector(
					`.playerLayersContainer .${layerName}.layer .header.line .name`);
				layerNameNode.textContent = name;
			};

			let ConfigureLayerPages = (pages, layerName) =>
			{
				let pagesNode = this.shadowRoot.querySelector(`.playerLayersContainer .${layerName}.layer .pages`);
				let linksListNode = this.shadowRoot.querySelector(
					`.playerLayersContainer .${layerName}.layer .triggers`);

				pages.forEach(
					(page, index) =>
					{
						let id = 'page' + index;
						let pageNode = document.createElement('div');
						pageNode.classList.add('page');
						pageNode.classList.add('hidden');
						pageNode.dataset.id = id;
						pageNode.appendChild(page.Node);
						pagesNode.appendChild(pageNode);

						let link = Videoplayer.Link.import.querySelector('template#link').content.cloneNode(true);
						link.querySelector('.text').textContent = page.Name;
						let linkNode = link.querySelector('.link.button.trigger');
						linkNode.dataset.id = id;
						linkNode.addEventListener('click',
							(args) =>
							{
								let btn = args.currentTarget;
								if(btn.classList.contains('markared'))
								{
									return;
								}

								this.shadowRoot.querySelector(
									`.playerLayersContainer .${layerName}.layer .triggers .trigger.markared`)
									.classList.remove('markared');
								this.shadowRoot.querySelector(
									`.playerLayersContainer .${layerName}.layer .pages .page:not(.hidden)`)
									.classList.add('hidden');

								btn.classList.add('markared');
								let page = this.shadowRoot.querySelector(
									`.playerLayersContainer .${layerName}.layer .pages .page[data-id='${btn.dataset.id}']`);
								page.classList.remove('hidden');

								this.dispatchEvent(new CustomEvent(`${layerName}PageChanged`,
									{
										detail:
											{
												button: btn,
												page:   page,
												pages:  this.shadowRoot.querySelectorAll(
													`.playerLayersContainer .${layerName}.layer .pages .page`),
												player: this,
											},
									}));
							},
						);
						linksListNode.appendChild(link);

					},
				);
			};

			let ConfigureSettings = () =>
			{
				const layerName = 'settings';

				ConfigureLayerName(configuration.Layers.SettingsLayer.Name, layerName);
				ConfigureLayerPages(configuration.Layers.SettingsLayer.Pages, layerName);
			};

			let ConfigureRecognition = () =>
			{
				const layerName = 'recognition';

				ConfigureLayerName(configuration.Layers.RecognitionLayer.Name, layerName);
				ConfigureLayerPages(configuration.Layers.RecognitionLayer.Pages, layerName);
			};

			try
			{
				ConfigureSettings();
			}
			catch(exc)
			{
				if(!configuration.Layers.SettingsLayer)
				{
					settingsBtn.classList.add('hidden');
				}
				console.error("no settings configuration");
			}

			try
			{
				ConfigureRecognition();
			}
			catch(exc)
			{
				if(!configuration.Layers.RecognitionLayer)
				{
					recognitionBtn.classList.add('hidden');
				}
				console.error("no recognition configuration");
			}
		};

		var ConfigurePlayerName = () =>
		{
			var playerNameNode = this.shadowRoot.querySelector(
				'.playerLayersContainer .video.layer .header.line .name');
			playerNameNode.textContent = configuration.Name;
		};

		var ConfigurePlayerSource = () =>
		{
			switch(configuration.PlayerType)
			{
				case 0:
					var playerSourceNode = this.shadowRoot.querySelector(
						'.playerLayersContainer .video.layer .videoContainer');
					let sourceNode = Videoplayer.Link.import.querySelector('template#imagePlayer')
												.content
												.cloneNode(true);
					var loadingProgress = this.shadowRoot.querySelector('.video.layer .controls.line .loadingProgress');
					sourceNode.querySelector('img').addEventListener('error',
						(args) =>
						{
							loadingProgress.classList.add('error');
							if(this._isPlayerStarted)
							{
								this.Stop();
							}
						});
					sourceNode.querySelector('img').addEventListener('load',
						(args) =>
						{
							if(loadingProgress.classList.contains('loading'))
							{
								loadingProgress.classList.remove('error');
								loadingProgress.classList.remove('loading');
							}
						});
					playerSourceNode.appendChild(sourceNode);
					break;
			}
		};

		ConfigurePlayerName();
		ConfigurePlayerSource();
		ConfigureTriggers();

		if(!configuration.Layers)
		{
			settingsBtn.classList.add('hidden');
			recognitionBtn.classList.add('hidden');
		}
		else
		{
			ConfigureLayers();
		}

		this._configuration = configuration;
	}

	Start()
	{
		this.shadowRoot.querySelector('#StartBtn').classList.add('hidden');
		this.shadowRoot.querySelector('#StopBtn').classList.remove('hidden');

		var loadingProgress = this.shadowRoot.querySelector('.video.layer .controls.line .loadingProgress');
		loadingProgress.classList.remove('error');
		loadingProgress.classList.add('loading');

		switch(this._configuration.PlayerType)
		{
			case 0:
				var imageNode = this.shadowRoot.querySelector('.sourceNode');
				imageNode.addEventListener('load', this._Reload);
				imageNode.src = `${this._configuration.Source}&temp=${Date.now()}`;
				break;
		}
		this._isPlayerStarted = !this._isPlayerStarted;

		this.dispatchEvent(new CustomEvent("playerStarted",
			{
				detail: this,
			}));
	}

	Stop()
	{
		this.shadowRoot.querySelector('#StopBtn').classList.add('hidden');
		this.shadowRoot.querySelector('#StartBtn').classList.remove('hidden');

		switch(this._configuration.PlayerType)
		{
			case 0:
				var imageNode = this.shadowRoot.querySelector('.sourceNode');
				imageNode.removeEventListener('load', this._Reload);
				imageNode.src = "";
				break;
		}
		this._isPlayerStarted = !this._isPlayerStarted;

		this.dispatchEvent(new CustomEvent("playerStopped",
			{
				detail: this,
			}));
	}

	get IsPlayerStarted()
	{
		return this._isPlayerStarted;
	}

	_BindCommands()
	{
		let BindPlayerCommands = () =>
		{
			var startBtn = this.shadowRoot.querySelector('#StartBtn');
			startBtn.addEventListener('click',
				() =>
				{
					this.Start();
				},
			);

			var stopBtn = this.shadowRoot.querySelector('#StopBtn');
			stopBtn.addEventListener('click',
				() =>
				{
					var loadingProgress = this.shadowRoot.querySelector('.video.layer .controls.line .loadingProgress');
					loadingProgress.classList.remove('error');
					loadingProgress.classList.remove('loading');
					this.Stop();
				},
			);
		};

		let BindExpandCommand = () =>
		{
			let btns = this.shadowRoot.querySelectorAll('.ExpandBtn');

			btns.forEach(
				(btn) =>
				{
					btn.addEventListener('click',
						() =>
						{
							this.classList.add('fullScreen');

							this.dispatchEvent(new CustomEvent("playerExpanded",
								{
									detail: this,
								}));
						},
					);
				});
		};

		let BindCollapseCommand = () =>
		{
			let btns = this.shadowRoot.querySelectorAll('.CollapseBtn');

			btns.forEach(
				(btn) =>
				{
					btn.addEventListener('click',
						() =>
						{
							this.classList.remove('fullScreen');

							this.dispatchEvent(new CustomEvent("playerCollapsed",
								{
									detail: this,
								}));
						},
					);
				});
		};

		let OpenLayer = (layerName) =>
		{
			this.shadowRoot.querySelector('.video.layer').classList.add('hidden');
			this.shadowRoot.querySelector(`.${layerName}.layer`).classList.remove('hidden');

			this.shadowRoot.querySelectorAll(
				`.playerLayersContainer .${layerName}.layer .pages .page:not(.hidden)`)
				.forEach(
					(node) =>
					{
						node.classList.add('hidden');
					});

			this.shadowRoot.querySelectorAll(
				`.playerLayersContainer .${layerName}.layer .triggers .trigger.markared`)
				.forEach(
					(node) =>
					{
						node.classList.remove('markared');
					});

			let firstPage = this.shadowRoot.querySelector(
				`.playerLayersContainer .${layerName}.layer .pages .page:first-child`);

			if(firstPage)
			{
				firstPage.classList
						 .remove('hidden');
			}

			let firstLink = this.shadowRoot.querySelector(
				`.playerLayersContainer .${layerName}.layer .triggers .trigger:first-child`);

			if(firstLink)
			{
				firstLink.classList
						 .add('markared');
			}
		};

		let CloseLayer = (layerName) =>
		{
			this.shadowRoot.querySelector('.video.layer').classList.remove('hidden');
			this.shadowRoot.querySelector(`.${layerName}.layer`).classList.add('hidden');
		};

		let LoadingProcessController =
				{
					Start: (layerName) =>
						   {
							   let process = this.shadowRoot.querySelector(
								   `.playerLayersContainer .${layerName}.layer .loadingProgress`);
							   process.classList.remove('error');
							   process.classList.add('loading');
						   },

					Stop: (layerName) =>
						  {
							  let process = this.shadowRoot.querySelector(
								  `.playerLayersContainer .${layerName}.layer .loadingProgress`);
							  process.classList.remove('error');
							  process.classList.remove('loading');

						  },

					Error: (layerName) =>
						   {
							   let process = this.shadowRoot.querySelector(
								   `.playerLayersContainer .${layerName}.layer .loadingProgress`);
							   process.classList.add('error');

						   },

					LockLayer: (layerName) =>
							   {
								   let process = this.shadowRoot.querySelector(
									   `.playerLayersContainer .${layerName}.layer .layerLocker`);
								   process.classList.remove('hidden');
							   },

					UnlockLayer: (layerName) =>
							   {
								   let process = this.shadowRoot.querySelector(
									   `.playerLayersContainer .${layerName}.layer .layerLocker`);
								   process.classList.add('hidden');
							   }

				};

		let BindSettingsCommands = () =>
		{
			const layerName = 'settings';

			let CloseLayerCallback = () =>
			{
				CloseLayer(layerName);
				this.dispatchEvent(new CustomEvent("settingsClosed",
					{
						detail: this,
					}));

				this.Start();
			};

			let CreateOnCloseEventArgs = (layerName) =>
			{
				let event = new LayerResultEventArgs(
					this
					.shadowRoot
					.querySelectorAll(`.playerLayersContainer .${layerName}.layer .pages .page`),
					this,
					CloseLayerCallback,
					LoadingProcessController,
					layerName);
				return event;
			};

			let BindOpenSettings = () =>
			{
				var settingsBtn = this.shadowRoot.querySelector('#SettingsBtn');
				settingsBtn.addEventListener('click',
					() =>
					{
						if(this._isPlayerStarted)
						{
							this.Stop();
						}

						OpenLayer(layerName);

						this.dispatchEvent(new CustomEvent("settingsOpened",
							{
								detail: this,
							}));
					},
				);
			};

			let BindAbortBtn = () =>
			{
				this.shadowRoot.querySelector("#AbortSettingsBtn")
					.addEventListener('click',
						() =>
						{
							this.dispatchEvent(
								new CustomEvent("settingsAborted", {detail: CreateOnCloseEventArgs(layerName)}));
						});
			};

			let BindApplyBtn = () =>
			{
				this.shadowRoot.querySelector("#ApplySettingsBtn")
					.addEventListener('click',
						() =>
						{
							this.dispatchEvent(
								new CustomEvent("settingsApplied", {detail: CreateOnCloseEventArgs(layerName)}));
						});
			};

			BindOpenSettings();
			BindApplyBtn();
			BindAbortBtn();
		};

		let BindRecognitionCommands = () =>
		{
			const layerName = 'recognition';

			let CloseLayerCallback = () =>
			{
				this.shadowRoot.querySelector("#FrameImg").src = '';
				SwitchView(false);
				CloseLayer(layerName);
				this.dispatchEvent(new CustomEvent("recognitionClosed",
					{
						detail: this,
					}));

				this.Start();
			};

			let BindOpenRecognition = () =>
			{
				var recognitionBtn = this.shadowRoot.querySelector('#ManualRecognitionBtn');
				var loadingProgress = this.shadowRoot.querySelector('.video.layer .controls.line .loadingProgress');

				recognitionBtn.addEventListener('click',
					async() =>
					{
						recognitionBtn.classList.remove('wait');
						recognitionBtn.classList.remove('error');

						if(this._isPlayerStarted)
						{
							recognitionBtn.classList.add('wait');
							if((loadingProgress.classList.contains('error') && loadingProgress.classList.contains(
									'loading')) || loadingProgress.classList.contains('loading'))
							{
								recognitionBtn.classList.add('error');
								throw "First image not loaded yet";
							}

							let image = this.shadowRoot.querySelector('.video.layer .sourceNode');

							let url = image.src.split('&temp=')[0];
							let base64 = null;

							try
							{
								base64 = await Videoplayer.ConvertUrlToBase64(`${url}&temp=${Date.now()}`);
							}
							catch(exc)
							{
								recognitionBtn.classList.add('error');
								throw "Unable to display recognition frame. Reason: " + exc;
							}

							if(!base64)
							{
								recognitionBtn.classList.add('error');
								throw "Unable to display recognition frame. Reason: " + exc;
							}

							let img = this.shadowRoot.querySelector('#FrameImg');
							img.src = base64;

							this.Stop();

							OpenLayer(layerName);
							recognitionBtn.classList.remove('wait');

							this.dispatchEvent(new CustomEvent("recognitionOpened",
								{
									detail: this,
								}));
						}
						else
						{
							recognitionBtn.classList.add('error');
							throw "player is stopped";
						}
					});
			};

			let BindAbortBtn = () =>
			{
				this.shadowRoot.querySelector("#AbortRecognitionBtn")
					.addEventListener('click',
						() =>
						{
							let event = new LayerResultEventArgs(
								this
								.shadowRoot
								.querySelectorAll(`.playerLayersContainer .${layerName}.layer .pages .page`),
								this,
								CloseLayerCallback,
								LoadingProcessController,
								layerName);

							this.dispatchEvent(new CustomEvent("recognitionAborted", {detail: event}));
						});
			};

			let BindRecognizeBtn = () =>
			{
				this.shadowRoot.querySelector("#RecognizeBtn")
					.addEventListener('click',
						() =>
						{
							let event = new OnRecognizeEventArgs(
								this
								.shadowRoot
								.querySelectorAll(`.playerLayersContainer .${layerName}.layer .pages .page`),
								this,
								CloseLayerCallback,
								LoadingProcessController,
								layerName,
								this.shadowRoot.querySelector("#FrameImg").src);

							this.dispatchEvent(new CustomEvent("recognitionApplied", {detail: event}));
						});
			};

			let SwitchView = (isShowImage) =>
			{
				let videoContainerNode = this.shadowRoot.querySelector(
					'.playerLayersContainer .recognition.layer .videoContainer');

				if(isShowImage)
				{
					videoContainerNode.classList.remove('hidden');
				}
				else
				{
					videoContainerNode.classList.add('hidden');
				}
			};

			let BindShowImageBtn = () =>
			{
				this.shadowRoot.querySelector('#ShowFrameBtn')
					.addEventListener('click',
						() =>
						{
							SwitchView(true);
							this.dispatchEvent(new CustomEvent("recognitionFrameShowed",
								{
									detail: this,
								}));
						});
			};

			let BindShowFormBtn = () =>
			{
				this.shadowRoot.querySelector('#ShowFormBtn')
					.addEventListener('click',
						() =>
						{
							SwitchView(false);
							this.dispatchEvent(new CustomEvent("recognitionFormShowed",
								{
									detail: this,
								}));
						});
			};

			BindShowImageBtn();
			BindShowFormBtn();
			BindOpenRecognition();
			BindRecognizeBtn();
			BindAbortBtn();
		};

		BindExpandCommand();
		BindCollapseCommand();
		BindPlayerCommands();
		BindSettingsCommands();
		BindRecognitionCommands();
	}

	_Reload(args)
	{
		var url = args.target.currentSrc.split('&temp=')[0];
		args.target.src = `${url}&temp=${Date.now()}`;
	}

	static Types()
	{
		return {
			Image: 0,
			Video: 1.,
		};
	}

	static ConvertUrlToBase64(url)
	{
		let img = new Image();
		img.crossOrigin = 'Anonymous';
		return new Promise((resolve, reject) =>
		{
			img.addEventListener('load',
				(args) =>
				{
					let canvas = document.createElement('CANVAS');
					let ctx = canvas.getContext('2d');
					canvas.height = args.target.height;
					canvas.width = args.target.width;
					ctx.drawImage(args.target, 0, 0);
					let dataURL = canvas.toDataURL();
					canvas = null;

					resolve(dataURL);
				});
			img.addEventListener('error',
				(args) =>
				{
					reject(new DOMException("Problem occurrence while loading image."));
				});
			img.src = url;
		});
	}
}

/**
 * Конфигурация видеоплеера
 * Параметры конструктора:
 * source - источник
 * playerType - тип видеоплеера
 * layers - настройки слоёв плеера
 * name - имя плеера
 * triggers - массив триггеров
 */
class VideoplayerConfiguration
{
	//TODO: передавать конфигурацию отображаемых кнопок. Управляющие кнопки по умолчанию не должны быть видны
	constructor(source, playerType, layers, name = "", triggers = [])
	{
		this.Triggers = triggers;
		this.Source = source;
		this.PlayerType = playerType;
		this.Name = name;
		this.Layers = layers;
	}
}

/**
 * Триггер видеоплеера
 * Параметры конструктора:
 * triggerName - отображаемое имя триггера
 * triggerId - идентификатор триггера
 */
class VideoplayerTrigger
{
	constructor(triggerName, triggerId)
	{
		this.TriggerName = triggerName;
		this.TriggerId = triggerId;
	}
}

/**
 * Настройки слоёв плеера
 * Праметры конструктора:
 * settingsLayerPages - страницы слоя настроек
 * recognitionLayerPages - страницы слоя распознавания
 */
class VideoplayerLayers
{
	constructor(settingsLayerPages = null, recognitionLayerPages = null)
	{
		this.SettingsLayer = settingsLayerPages;
		this.RecognitionLayer = recognitionLayerPages;
	}
}

class VideoplayerLayer
{
	constructor(name, pages = [])
	{
		this.Name = name;
		this.Pages = pages;
	}
}

class LayerPage
{
	constructor(name, node)
	{
		this.Name = name;
		this.Node = node;
	}
}

class LayerResultEventArgs
{
	constructor(pages, player, closeLayerCallback, processController, layerName)
	{
		this.Pages = pages;
		this.Player = player;
		this.CloseLayer = closeLayerCallback;
		this.ShowProcess = () => processController.Start(layerName);
		this.HideProcess = () => processController.Stop(layerName);
		this.ProcessError = () => processController.Error(layerName);
		this.LockLayer = () => processController.LockLayer(layerName);
		this.UnlockLayer = () => processController.UnlockLayer(layerName);
	}
}

class OnRecognizeEventArgs
	extends LayerResultEventArgs
{
	constructor(pages, player, closeLayerCallback, processController, layerName, imageData)
	{
		super(pages, player, closeLayerCallback, processController, layerName);
		this.ImageData = imageData;
	}
}