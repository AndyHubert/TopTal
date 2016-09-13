import { Component, OnInit } from '@angular/core';

import { DataService } from '../data.service';

@Component({
	selector: 'c-user-settings',
	template: `
		<div class="box">
			<div class="boxrow">Username: <input id="settings-username" [(ngModel)]="username" /></div>
			<div class="boxrow">Admin level:
				<select class="form-control" [(ngModel)]="adminLevel">
					<option value="1" [selected]="adminLevel==1" >User</option>
					<option *ngIf="dataService.me.adminLevel >= 2 || dataService.state.user.adminLevel >= 2" value="2" [selected]="adminLevel==2" >Manager</option>
					<option *ngIf="dataService.me.adminLevel >= 3 || dataService.state.user.adminLevel >= 3" value="3" [selected]="adminLevel==3" >Admin</option>
				</select>
			</div>
			<div class="boxrow">Expected calories / day: 
				<input
					class="{{ dataService.state.expectedCaloriesClass }}"
					[(ngModel)]="expectedPerDay"
				/>
			</div>
			<div><button (click)="update()">Update</button></div>
		</div>
  	`,
	styles: [`
		.under-expected-calories {
			background: green;
			color: white;
		}
		.over-expected-calories {
			background: red;
			color: white;
		}
	`]
})

export class UserSettingsComponent implements OnInit {
	username: string;
	adminLevel: number;
	expectedPerDay: number;

	constructor(
		private dataService: DataService
	) { }

	update(): void {
		this.dataService
			.ajax('put', '/user/'+this.dataService.state.user._id, {
				username: this.username,
				adminLevel: this.adminLevel,
				expectedPerDay: this.expectedPerDay
			}, (user) => {
				this.dataService.state.user = user;
				if(this.dataService.me._id==user._id) {
					this.dataService.me = user;
				}
			});
	}

    ngOnInit(): void {
		this.username = this.dataService.state.user.username;
		this.adminLevel = this.dataService.state.user.adminLevel;
		this.expectedPerDay = this.dataService.state.user.expectedPerDay;
	}
}