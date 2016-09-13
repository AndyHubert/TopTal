import { Component, Input, OnInit } from '@angular/core';

import { DataService } from '../data.service';

import { Meal } from '../meal';

@Component({
	selector: 'tr.c-meal',
	template: `
        <td>
            <span *ngIf="!editMode">{{ meal.dateandtime | date:"MM/dd/yyyy" }}</span>
            <input *ngIf="editMode" placeholder="date" [(ngModel)]="dateStr" type="date" />
        </td>
        <td>
            <span *ngIf="!editMode">{{ meal.dateandtime | date:"jm" }}</span>
            <input *ngIf="editMode" placeholder="time" [(ngModel)]="timeStr" type="time" />
        </td>
        <td>
            <span *ngIf="!editMode">{{ meal.description }}</span>
            <input *ngIf="editMode" placeholder="description" [(ngModel)]="meal.description" />
        </td>
        <td>
            <span *ngIf="!editMode">{{ meal.calories }}</span>
            <input *ngIf="editMode" placeholder="calories" [(ngModel)]="meal.calories" />
        </td>
        <td>
            <button *ngIf="!meal._id" (click)="addMeal()">Add as new</button>
            <button *ngIf="meal._id && !editMode" (click)="editMeal()">Edit</button>
            <button *ngIf="meal._id && !editMode" (click)="deleteMeal()">Delete</button>
            <button *ngIf="meal._id && editMode" (click)="saveMeal()">Save</button>
            <button *ngIf="meal._id && editMode" (click)="cancelEdit()">Cancel</button>
        </td>
  	`,
})

export class MealComponent implements OnInit {

    private origState: Meal;
    private viewingMyOwn: boolean;

    dateStr: string;
    timeStr: string;

    editMode: Boolean;

	constructor(
		private dataService: DataService
	) { }

    @Input()
    meal: Meal;

	addMeal(): void {
        this.meal.dateandtime = new Date(this.dateStr + ' ' + this.timeStr); 
        if(!this.viewingMyOwn) {
            this.meal.userid = this.dataService.state.user._id;
        }
        this.dataService.ajax('post', '/meals', this.meal, data => {
            if(this.viewingMyOwn) {
                delete data.userid;
            }
            this.dataService.state.meals.push(data);
            this.meal = new Meal;
            this.sortMeals();
            this.dataService.updateExpectedCaloriesClass();
        });
	}

	editMeal(): void {
        this.dataService.error = '';
        this.editMode = true;
	}

	deleteMeal(): void {
        this.dataService.ajax(
            'delete', 
            '/meals/'+this.meal._id, 
            this.viewingMyOwn ? null : { userid: this.dataService.state.user._id }, 
            data => {
                this.dataService.state.meals = this.dataService.state.meals.filter(meal => {
                    return meal != this.meal;
                });
                this.dataService.filterMeals();
                this.dataService.updateExpectedCaloriesClass();
            }
        );
	}

	saveMeal(): void {
        this.meal.dateandtime = new Date(this.dateStr + ' ' + this.timeStr); 
        this.dataService.ajax('put', '/meals/'+this.meal._id, this.meal, data => {
            this.editMode = false;
            this.sortMeals();
            this.dataService.updateExpectedCaloriesClass();
            this.origState = Object.assign({}, this.meal);
        });
	}

	cancelEdit(): void {
        this.dataService.error = '';
        this.meal = Object.assign({}, this.origState);
        this.editMode = false;
	}

    ngOnInit(): void {
        this.editMode = !this.meal._id;
        this.origState = Object.assign({}, this.meal);
        this.viewingMyOwn = this.dataService.state.user == this.dataService.me;
        if(this.viewingMyOwn) {
            delete this.meal.userid;
        }
        let d = (this.meal.dateandtime || new Date());
        d.setSeconds(0);
        this.dateStr = d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).substr(-2) + '-' + ('0'+d.getDate()).substr(-2);
        this.timeStr = d.toTimeString().split(' ')[0];
    }

    private sortMeals(): void {
        this.dataService.state.meals.sort((a:any, b:any) => { return b.dateandtime-a.dateandtime; });
        this.dataService.filterMeals();
    }
}
