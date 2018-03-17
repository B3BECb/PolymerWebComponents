/**
 * Подгружает зависимости
 * @param {String} reference
 */
;(function()
{
	/**
	 * Ссылка на скрипт
	 */
	class Reference
	{
		/**
		 * Создаёт новую ссылку на скрипт
		 * @param id уникальный идентификатор скрипта
		 * @param path путь к скрипту
		 */
		constructor(id, path, onLoaded = null, contentType = "script")
		{
			this.Id            = id;
			this.Path          = path;
			this.OnLoaded      = onLoaded;
			this.ContentType   = contentType;
			this.Loaded        = false;
			this.ReferenceName = `Included_${contentType}_${id}`;
		}
	};

	/**
	 * Загручик зависимостей
	 */
	class Builder
	{
		/**
		 * Создаёт загрузчик зависимостей
		 */
		constructor()
		{
			this.CurrentId  = null;
			this.References = [];
			this.IsServiceWorker = false;

			var that             = this;
			this.Build.AfterAll  = (callback) =>
			{
				that.AfterAll.CallBack = callback;
				return that.Build;
			};
			this.Build.AfterEach = (callback) =>
			{
				that.AfterEach.CallBack = callback;
				return that.Build;
			};
		}

		/**
		 * Выполняет регистрацию скрипта
		 * @param {String} ref - Ссылка на скрипт
		 * @param {function} onLoaded - Функция вызываемая после загрузки скрипта
		 * @returns {Builder}
		 * @constructor
		 */
		RegisterScript(ref, onLoaded = null)
		{
			if(!(typeof ref === 'string' || ref instanceof String))
			{
				Console.error("Builder.RegisterScript attribute 'ref' is not string");
				return;
			}

			if(ref.trim() == '')
			{
				Console.error("Builder.RegisterScript attribute 'ref' is null or empty");
				return;
			}

			var reference = new Reference(this.References.length, ref, onLoaded);

			if(this.References.find((element) => { return element.Path == reference.Path; }))
				return this;

			var dependentElementIndex = this.References.length;

			if(this.CurrentId != null)
			{
				dependentElementIndex = this.References.indexOf(this.References[this.CurrentId]);
			}

			this.References.splice(dependentElementIndex + 1, 0, reference);

			//console.log('script ' + ref + ' registred');

			return this;
		}

		/**
		 * Выполняет регистрацию html страницы
		 * @param {String} ref - Ссылка на страницу
		 * @param {function} onLoaded - Функция вызываемая после загрузки страницы
		 * @returns {Builder}
		 * @constructor
		 */
		RegisterHtmlTemplate(ref, onLoaded = null)
		{
			if(this.IsServiceWorker)
				throw 'Unavailable for Service Worker';

			if(!(typeof ref === 'string' || ref instanceof String))
			{
				Console.error("Builder.RegisterHtmlTemplate attribute 'ref' is not string");
				return;
			}

			if(ref.trim() == '')
			{
				Console.error("Builder.RegisterHtmlTemplate attribute 'ref' is null or empty");
				return;
			}

			var reference = new Reference(this.References.length, ref, onLoaded, 'link');

			if(this.References.find((element) => { return element.Path == reference.Path; }))
				return this;

			var dependentElementIndex = this.References.length;

			if(this.CurrentId != null)
			{
				dependentElementIndex = this.References.indexOf(this.References[this.CurrentId]);
			}

			this.References.splice(dependentElementIndex + 1, 0, reference);

			//console.log('link ' + ref + ' registred');

			return this;
		}

		/**
		 * Загрузить и разрешить зависимости
		 * @param id - порядковый номер в массиве
		 * @returns {Builder.Build}
		 * @constructor
		 */
		Build(id = null)
		{
			var reference = null;
			if(!id)
				reference = this.References[0];
			else
				reference = this.References[id];

			if(!reference)
				return;

			this.CurrentId = reference.Id;

			var that = this;

			var head    = document.getElementsByTagName('head')[0];
			var element = document.createElement(reference.ContentType);

			switch(reference.ContentType)
			{
				case 'script':
					element.type = 'text/javascript';
					element.src  = reference.Path;
					break;
				case 'link':
					element.rel  = 'import';
					element.href = reference.Path;
					break;
			}

			element.id     = reference.ReferenceName;
			element.onload = () =>
			{
				reference.Loaded = true;
				that.AfterEach(reference);
				if(reference.OnLoaded)
					reference.OnLoaded(reference);

				var next = that.References.findIndex((ref) => {return ref.Loaded == false;});
				if(next >= 0)
					that.Build(next);
				else
					that.AfterAll();

				//console.log(reference.Path + ' - loaded');
			};

			head.insertBefore(element, head.lastChild);

			return this.Build;
		}

		/**
		 * Выполнить после загрузки всех зависимостей
		 * @constructor
		 */
		AfterAll()
		{
			if(this.AfterAll.CallBack)
				this.AfterAll.CallBack();
		}

		/**
		 * Выполнить после каждой загрузки
		 * @param ref
		 * @constructor
		 */
		AfterEach(ref)
		{
			if(this.AfterEach.CallBack)
				this.AfterEach.CallBack(ref);
		}
	}

	/**
	 * Загрузчик зависимостей
	 * @type {Builder}
	 */
	window.Builder = new Builder();

}());