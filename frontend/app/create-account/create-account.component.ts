import { Component } from '@angular/core';

import { DataService } from '../data.service';

@Component({
	selector: 'c-create-account',
	template: `
		<h4>Create an account</h4>  
		<div class="box">
			<div class="boxrow">Username: <input [(ngModel)]="username" placeholder="username" /></div>
			<div class="boxrow">Password: <input [(ngModel)]="password" type="password" placeholder="password" /></div>
		</div>
		<div>
			<button (click)="createAcct()">Create account</button>
		</div>
  	`
})

export class CreateAccountComponent {
	private username = '';
	private password = '';

	constructor(
		private dataService: DataService
	) { }
	
	createAcct(): void {
		this.dataService
			.ajax('post', '/user', {
				username: this.username,
				password: this.password
			});
	}
}
