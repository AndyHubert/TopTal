import { Component } from '@angular/core';

import { DataService } from '../data.service';

@Component({
	selector: 'c-logged-in',
	template: `
		<h4>Welcome, {{ dataService.me.username }}</h4> 
		<button (click)="dataService.logout()">Logout</button>
  	`
})

export class LoggedInComponent {
	constructor(
		private dataService: DataService
	) { }
}
