window.Builder
	  .RegisterHtmlTemplate("PolymerPaginator/PolymerPaginatorTemplate.html",
		  (link) =>
		  {
			  MDPaginator.Link = document.querySelector('#' + link.ReferenceName);

			  window.customElements.define(MDPaginator.is, MDPaginator);
		  });

class MDPaginator
	extends Polymer.Element
{
	static get is()
	{
		return "md-paginator";
	}

	constructor()
	{
		super();

		this.CurrentOffset = 0;
		this.OffsetCount = 0;
		this.TotalRecords = 0;

		this.TotalPages = 0;
		this.CurrentPage = 0;
	}

	static get properties()
	{
		return {
			pages: {
				value()
				{
					return [
						//{id:'1', selected: 'selected'},
					];
				},
			},
		};
	}

	goToFirst()
	{
		this.Paginate(1);
	}

	goToPrevious()
	{
		this.PaginateBackward();
	}

	goToNext()
	{
		this.PaginateForward();
	}

	goToLast()
	{
		this.Paginate(this.TotalPages);
	}

	goToPage(args)
	{
		var page = args.srcElement.textContent;
	}

	CalcPages()
	{
		this.TotalPages = Math.ceil(this.TotalRecords / this.OffsetCount);
		this.CurrentPage = this.CurrentOffset / this.OffsetCount + 1;
	}

	Update(currentOffset, offsetCount, totalRecords)
	{
		this.CurrentOffset = currentOffset;
		this.OffsetCount = offsetCount;
		this.TotalRecords = totalRecords;
	}

	PaginateForward()
	{
		if(this.CurrentPage >= this.TotalPages) return;

		this.CurrentPage++;
		return this.Paginate(this.CurrentPage);
	}

	PaginateBackward()
	{
		if(this.CurrentPage <= 1) return;

		this.CurrentPage--;
		return this.Paginate(this.CurrentPage);
	}

	Paginate(pageIndex)
	{
		this.CurrentPage = pageIndex;

		this.CurrentOffset = (pageIndex - 1) * this.OffsetCount;

		this.dispatchEvent(new CustomEvent("pageChanged", {detail: this}));
	}

	FillPagesNumbers()
	{
		this.pages = [];

		if(!this.TotalPages)
		{
			this.style.display = 'none';
		}
		else
		{
			this.style.display = 'block';

			var pageRange = 3;
			var start = this.CurrentPage;
			var stop = start + (Math.ceil(pageRange / 2) - pageRange % 2);

			var items = this.root.querySelectorAll('.controlsBackward .item');
			if(this.CurrentPage != 1)
			{
				items.forEach(
					(item) =>
					{
						item.classList.remove('disabled');
					});

				start = this.CurrentPage - (Math.ceil(pageRange / 2) - pageRange % 2);
				stop = this.CurrentPage + (Math.ceil(pageRange / 2) - pageRange % 2);
			}
			else
			{
				items.forEach(
					(item) =>
					{
						item.classList.add('disabled');
					});
			}

			items = this.root.querySelectorAll('.controlsForward .item');
			if(this.CurrentPage != this.TotalPages)
			{
				items.forEach(
					(item) =>
					{
						item.classList.remove('disabled');
					});
			}
			else
			{
				items.forEach(
					(item) =>
					{
						item.classList.add('disabled');
					});

				start = this.CurrentPage - (Math.ceil(pageRange / 2) - pageRange % 2);
				stop = this.TotalPages;
			}

			for(let i = start; i <= stop && i <= this.TotalPages; i++)
			{
				if(i < 1)
				{
					continue;
				}

				var item = {id: i, selected: ''};

				if(i == this.CurrentPage)
				{
					item.selected = 'selected';
				}

				this.pages.push(item);
			}
		}
	}
}