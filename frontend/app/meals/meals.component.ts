import { Component } from '@angular/core';

import { DataService } from '../data.service';

import { Meal } from '../meal';

@Component({
	selector: 'c-meals',
	template: `
		<table class="table table-striped">
			<thead>
				<tr>
					<th>Date</th>
					<th>Time</th>
					<th>Meal</th>
					<th>Calories</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr class="c-meal" [meal]="newMeal"></tr>
				<tr class="c-meal" *ngFor="let meal of dataService.state.filteredMeals" [meal]="meal"></tr>
			</tbody>
		</table>
  	`,
	styles: [`
		.newmeal {
			background: red;
			column-span: all;
		}
	`]
})

export class MealsComponent {
	constructor(
		private dataService: DataService
	) { }

	newMeal = new Meal;
}
