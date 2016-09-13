import { Component, Output, EventEmitter } from '@angular/core';

import { DataService } from '../data.service';

@Component({
	selector: 'c-user-chooser',
	template: `
        <div>
            <label>Viewing:</label> <select class="form-control" (change)="showUser($event.target.value)">
                <option *ngFor="let user of dataService.state.userList" [value]="user._id">{{user.username}}</option>
            </select>
        </div>
  	`
})

export class UserChooserComponent {
	constructor(
		private dataService: DataService
	) { }

    @Output()
    userUpdated = new EventEmitter();

	showUser(_id: string): void {
        let choseMyself = _id == this.dataService.me._id;

        //get the user record
        if(choseMyself) {
            this.dataService.state.user = this.dataService.me;
        } else {
            this.dataService
                .ajax('get', '/user/'+_id, null, 'user');
        }

        // get the meals
        this.dataService.state.meals = null;
        if(choseMyself || this.dataService.me.adminLevel >= 3) {
            this.dataService
                .ajax('get', '/meals'+(choseMyself ? '' : '?userid='+_id), null, 'meals');
        }

        this.userUpdated.emit();
	}
    
}
