import { Component } from '@angular/core';

import { DataService } from '../data.service';

@Component({
	selector: 'c-meals-filter',
	template: `
		<div class="boxrow">
			Date filter:
				<input
					type="date"
					[(ngModel)]="dataService.state.filter.fromDate"
					placeholder="From date"
					(change)="dataService.filterMeals()"
				/>
				→
				<input
					type="date"
					[(ngModel)]="dataService.state.filter.toDate"
					placeholder="To date"
					(change)="dataService.filterMeals()"
				/>
		</div>
		<div class="boxrow">
			Time filter:
				<input
					type="time"
					[(ngModel)]="dataService.state.filter.fromTime"
					placeholder="From time"
					(change)="dataService.filterMeals()"
				/>
				→
				<input
					type="time"
					[(ngModel)]="dataService.state.filter.toTime"
					placeholder="To time"
					(change)="dataService.filterMeals()"
				/>
		</div>
  	`
})

export class MealsFilterComponent {
	constructor(
		private dataService: DataService
	) { }
}
