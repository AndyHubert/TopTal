import { Component } from '@angular/core';

import { CreateAccountComponent } from './create-account/create-account.component';
import { LoginComponent } from './login/login.component';
import { LoggedInComponent } from './logged-in/logged-in.component';
import { UserChooserComponent } from './user-chooser/user-chooser.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { MealsFilterComponent } from './meals-filter/meals-filter.component';
import { MealsComponent } from './meals/meals.component';
import { MealComponent } from './meal/meal.component';
import { DataService } from './data.service';

import { User } from './user';

@Component({
	selector: 'my-app',
	template: `
		<div *ngIf="dataService.loadingReqs > 0" class="loader"></div>
		<h2>Calorie Counter</h2>
		<div class="error">{{ dataService.error }}</div>
		<div *ngIf="!dataService.me">
			<c-create-account></c-create-account>
			<c-login></c-login>
		</div>
		<div *ngIf="dataService.me">
			<c-logged-in></c-logged-in>
			<c-user-chooser *ngIf="dataService.me.adminLevel > 1" (userUpdated)="hideSettings()"></c-user-chooser>
			<c-user-settings *ngIf="showingSettings"></c-user-settings>
			<div>
				<button *ngIf="!showingSettings" (click)="showSettings()">Show settings</button>
				<button *ngIf="showingSettings" (click)="hideSettings()">Hide settings</button>
			</div>
			<div *ngIf="dataService.state.meals">
				<h4>Meals</h4>
				<c-meals-filter></c-meals-filter>
				<c-meals></c-meals>
			</div>
		</div>
	`
})

export class AppComponent {
	showingSettings = false;

	constructor(
		private dataService: DataService
	) { }

	showSettings(): void {
		this.showingSettings = true;
	}

	hideSettings(): void {
		this.showingSettings = false;
	}

}
