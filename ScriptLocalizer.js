
class ScriptLocalizer
{
	constructor(languages = null)
	{
		this.DEFAULTLANGUAGE = "en";

		this.CurrentLanguage = CookieManager.getCookie("language");

		if(Array.isArray(languages) && languages[0] instanceof Language)
		{
			this._languages = languages;
			return;
		}

		this._languages = [];

		var lang = new Language("ru");
		lang.AddString("Locale.JavaScripts.Filthypillow.AcceptBtn", "Применить");

		lang.AddString("Locale.JavaScripts.Paginator.Forward", "Вперёд");
		lang.AddString("Locale.JavaScripts.Paginator.Back", "Назад");

		lang.AddString("Locale.Pages.Journal.Tabs.SearchTab.Buttons.Search", "ПОИСК");
		lang.AddString("Locale.Pages.Journal.Tabs.SearchTab.Buttons.Cancel", "ОТМЕНА");
		lang.AddString("Locale.Pages.Journal.Tabs.SearchTab.Title", "Поиск");

		lang.AddString("Locale.Components.DataTable.Menu.Columns", "Столбцы");
		lang.AddString("Locale.Components.DataTable.Menu.SelectAll", "Выбрать всё");
		lang.AddString("Locale.Components.DataTable.Menu.ClearAll", "очистить");
		lang.AddString("Locale.Components.DataTable.Menu.Apply", "ПРИНЯТЬ");
		lang.AddString("Locale.Components.DataTable.Menu.Cancel", "ОТМЕНА");
		lang.AddString("Locale.Components.DataTable.RowsCountHeader", "Выбрано");
		this._languages.push(lang);



		lang = new Language("en");
		lang.AddString("Locale.JavaScripts.Filthypillow.AcceptBtn", "Apply");

		lang.AddString("Locale.JavaScripts.Paginator.Forward", "Forward");
		lang.AddString("Locale.JavaScripts.Paginator.Back", "Back");

		lang.AddString("Locale.Pages.Journal.Tabs.SearchTab.Buttons.Search", "SEARCH");
		lang.AddString("Locale.Pages.Journal.Tabs.SearchTab.Buttons.Cancel", "CANCEL");
		lang.AddString("Locale.Pages.Journal.Tabs.SearchTab.Title", "Search");

		lang.AddString("Locale.Components.DataTable.Menu.Columns", "Columns");
		lang.AddString("Locale.Components.DataTable.Menu.SelectAll", "Select all");
		lang.AddString("Locale.Components.DataTable.Menu.ClearAll", "clear");
		lang.AddString("Locale.Components.DataTable.Menu.Apply", "APPLY");
		lang.AddString("Locale.Components.DataTable.Menu.Cancel", "CANCEL");
		lang.AddString("Locale.Components.DataTable.RowsCountHeader", "Selected");
		this._languages.push(lang);
	}

	GetLocalizedString(stringId, defaultSting = null)
	{
		//Verify.Argument.IsNotNull(stringId, "ScriptLocalizer.GetLocalizedString.stringId is null");

		var language = CookieManager.getCookie("language");
		language     = (language) ? language : this.DEFAULTLANGUAGE;
		this.CurrentLanguage = language;

		language = this._languages.find(function(lang)
		{
			return (lang.Id == language) ? lang : false;
		});

		if(!language)
			return defaultSting;

		var string = language.FindString(stringId);

		return (string) ? string.Value : defaultSting;
	}
}
;

class Language
{
	constructor(id)
	{
		this._strings = [];

		//Verify.Argument.IsNotNull(id, "Language.constructor.id is null");

		this.Id = id;
	}

	AddString(id, value)
	{
		this._strings.push(new LocalizableString(id, value));
	}

	FindString(id)
	{
		var result = this._strings.find(function(string)
			{
				return (string.Id == id) ? string.Value : false;
			},
		);

		return (result) ? result : false;
	}
}

class LocalizableString
{
	constructor(id, string)
	{
		//Verify.Argument.IsNotNull(id, "LocalizableString.constructor.id is null");
		//Verify.Argument.IsNotNull(string, "LocalizableString.constructor.string is null");

		this.Id    = id;
		this.Value = string;
	}
}

Localizer = new ScriptLocalizer();