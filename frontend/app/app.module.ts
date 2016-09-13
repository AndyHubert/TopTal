import { NgModule, Injectable }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule, BrowserXhr }    from '@angular/http';

import { AppComponent }   from './app.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { LoginComponent } from './login/login.component';
import { LoggedInComponent } from './logged-in/logged-in.component';
import { UserChooserComponent } from './user-chooser/user-chooser.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { MealsFilterComponent } from './meals-filter/meals-filter.component';
import { MealsComponent } from './meals/meals.component';
import { MealComponent } from './meal/meal.component';
import { DataService }    from './data.service';

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
	    HttpModule
	],
	declarations: [
		AppComponent,
		CreateAccountComponent,
		LoginComponent,
		LoggedInComponent,
		UserChooserComponent,
		UserSettingsComponent,
		MealsFilterComponent,
		MealsComponent,
		MealComponent
	],
	providers: [
		DataService
	],
	bootstrap: [
		AppComponent
	]
})

export class AppModule { }
