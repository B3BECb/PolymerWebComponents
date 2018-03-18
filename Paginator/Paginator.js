Builder
	.RegisterHtmlTemplate("Components/Elements/Paginator.PaginatorTemplate.html",
		(link) =>
		{
			MDPaginator.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('md-paginator', MDPaginator);
		});

class MDPaginator extends HTMLElement
{
	constructor()
	{
		super();

		this.CurrentOffset = 0;
		this.OffsetCount   = 0;
		this.TotalRecords  = 0;

		this.TotalPages  = 0;
		this.CurrentPage = 0;

		this.InsertTemplate();
	}

	InsertTemplate()
	{
		var content = MDPaginator.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));

		this.BindCommands();
	}

	BindCommands()
	{
		var backward = this.shadowRoot.querySelectorAll('.controlsBackward .item');

		backward[1].addEventListener('click',
			() =>
			{
				this.PaginateBackward();
			});
		backward[0].addEventListener('click',
			() =>
			{
				this.Paginate(1);
			});

		var forward = this.shadowRoot.querySelectorAll('.controlsForward .item');

		forward[0].addEventListener('click',
			() =>
			{
				this.PaginateForward();
			});
		forward[1].addEventListener('click',
			() =>
			{
				this.Paginate(this.TotalPages);
			});
	}

	CalcPages()
	{
		this.TotalPages  = Math.ceil(this.TotalRecords / this.OffsetCount);
		this.CurrentPage = this.CurrentOffset / this.OffsetCount + 1;
	}

	Update(currentOffset, offsetCount, totalRecords)
	{
		this.CurrentOffset = currentOffset;
		this.OffsetCount   = offsetCount;
		this.TotalRecords  = totalRecords;
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

		this.dispatchEvent(new CustomEvent("pageChanged", {detail:this}));
	}

	FillPagesNumbers()
	{
		var pages = this.shadowRoot.querySelector('.pages');
		pages.querySelectorAll(".item")
			.forEach(
				function(element)
				{
					element.parentNode.removeChild(element);
				},
			);

		if(!this.TotalPages)
		{
			this.shadowRoot.querySelector('.container').style.display = 'none';
		}
		else
		{
			this.shadowRoot.querySelector('.container').style.display = 'block';

			var pageRange = 3;
			var start = this.CurrentPage;
			var stop = start + (Math.ceil(pageRange/2) - pageRange%2);

			var items = this.shadowRoot.querySelectorAll('.controlsBackward .item');
			if(this.CurrentPage != 1)
			{
				items.forEach(
					(item) =>
					{
						item.classList.remove('disabled');
					});

				start = this.CurrentPage - (Math.ceil(pageRange/2) - pageRange%2);
				stop = this.CurrentPage + (Math.ceil(pageRange/2) - pageRange%2);
			}
			else
			{
				items.forEach(
					(item) =>
					{
						item.classList.add('disabled');
					});
			}

			items = this.shadowRoot.querySelectorAll('.controlsForward .item');
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

				start = this.CurrentPage - (Math.ceil(pageRange/2) - pageRange%2);
				stop = this.TotalPages;
			}

			for(let i = start; i <= stop && i <= this.TotalPages; i++)
			{
				if(i < 1)
					continue;

				var page = MDPaginator.Link.import.querySelector('template#item').content;
				pages.appendChild(page.cloneNode(true));

				var item         = pages.querySelectorAll(".item");
				item             = item[item.length - 1];
				item.textContent = i;

				if(i == this.CurrentPage)
				{
					item.classList.add('selected');
				}
				else
				{
					item.addEventListener('click',
						() =>
						{
							this.Paginate(i);
						})
				}
			}
		}
	}
}