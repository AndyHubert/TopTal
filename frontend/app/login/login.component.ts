import { Component } from '@angular/core';

import { DataService } from '../data.service';

@Component({
	selector: 'c-login',
	template: `
		<h4>Login</h4>  
		<div class="box">
			<div class="boxrow" >Username: <input [(ngModel)]="username" placeholder="username" /></div>
			<div class="boxrow" >Password: <input [(ngModel)]="password" type="password" placeholder="password" /></div>
		</div>
		<div>
			<button (click)="login()">Login</button>
		</div>
  	`
})

export class LoginComponent {
	private username = '';
	private password = '';

	constructor(
		private dataService: DataService
	) { }
	
	login(): void {
		this.dataService
			.login(this.username, this.password);
	}
}
