import { Injectable, isDevMode }    from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { User } from './user';
import { Meal } from './meal';

const dateKeys = ['dateandtime'];
const url = isDevMode() ? 'http://localhost:3000' : '';

@Injectable()
export class DataService {
    private authToken: string;

    me: User;
    state: {
        userList: [{_id: string, username: string}],
        user: User,
        meals: Meal[],
        filteredMeals: Meal[],
        filter: {
            fromDate: string,
            toDate: string,
            fromTime: string,
            toTime: string
        },
        expectedCaloriesClass: string
    };
    error: string = '';
    loadingReqs: number = 0;

    constructor(
        private http: Http
    ) {
		if(this.authToken = localStorage.getItem('authToken')) {
            this.ajax('get', '/user', null, (user) => {
                this.initState({data: user, token: this.authToken})
            });
        }
    }

    login(username: string, password: string): void {
        this.error = '';
        this.loadingReqs++;
        this.http
            .post(url+'/login', JSON.stringify({
                username: username,
                password: password
            }), {headers: this.getHeaders()})
            .toPromise()
            .then(res => {
                let resObj = res.json();
                if(resObj.error) {
                    this.error = resObj.message;
                } else {
                    this.initState(resObj);
                }
                this.loadingReqs--;
            })
            .catch((error) => this.handleError(error));
    }

	logout(): void {
        this.authToken = null;
        this.me = null;
		this.state = null;
		this.error = '';
        localStorage.removeItem('authToken');
	}

    ajax(method: string, path: string, data?: Object, stateUpdate?): void {
        this.error = '';
        let isMethodWithBody = (method=='post' || method=='put');
        let queryStr = '';
        if(!isMethodWithBody && data) {
            let str = [];
            for(var p in data)
                if (data.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
                }
            queryStr = '?' + str.join("&");
        }
        this.loadingReqs++;
        this.http
            .request(url+path+queryStr, {
                headers: this.getHeaders(),
                method: method,
                body: isMethodWithBody ? data : null
            })
            .toPromise()
            .then(res => {
                let resObj = res.json();
                if(resObj.error) {
                    this.error = resObj.message;
                } else {
                    this.recoverDates(resObj.data);
                    if(resObj.token) {
                        this.initState(resObj);
                    } else if(typeof stateUpdate == "function") {
                        stateUpdate(resObj.data);
                    } else if(stateUpdate) {
                        this.state[stateUpdate] = resObj.data;
                        if(stateUpdate == 'meals') {
                            this.filterMeals();
                        }
                    }
                    this.updateExpectedCaloriesClass();
                }
                this.loadingReqs--;
            })
            .catch((error) => this.handleError(error));
    }

    filterMeals(): void {
        let fromDate = new Date(this.state.filter.fromDate);
        let toDate = new Date(this.state.filter.toDate);
        toDate.setHours(23);
        toDate.setMinutes(59);
        toDate.setSeconds(59);
        toDate.setMilliseconds(999);
        this.state.filteredMeals = this.state.meals.filter(meal => {
            var fromTime = new Date(meal.dateandtime.toLocaleDateString()+' '+(this.state.filter.fromTime || 'makebaddate'));
            var toTime = new Date(meal.dateandtime.toLocaleDateString()+' '+(this.state.filter.toTime || 'makebaddate'));
            return (
                (isNaN(fromDate.getTime()) || meal.dateandtime >= fromDate) 
                &&
                (isNaN(toDate.getTime()) || meal.dateandtime <= toDate) 
                &&
                (isNaN(fromTime.getTime()) || meal.dateandtime >= fromTime) 
                &&
                (isNaN(toTime.getTime()) || meal.dateandtime <= toTime) 
            );
        });
    }

	updateExpectedCaloriesClass(): void {
		if(!this.state.meals) {
            this.state.expectedCaloriesClass = '';
        } else {
            let todayDateStr = new Date().toLocaleDateString();
            let totalCalsToday = 0;

            this.state.meals.forEach(meal => {
                if(meal.dateandtime.toLocaleDateString() == todayDateStr) {
                    totalCalsToday += meal.calories; 
                } 
            });

            if(totalCalsToday < this.state.user.expectedPerDay) {
                this.state.expectedCaloriesClass = 'under-expected-calories';
            } else {
                this.state.expectedCaloriesClass = 'over-expected-calories';
            }
        }
	}

    private getHeaders = function() {
        return new Headers({
            'Content-Type': 'application/json',
            'Authorization': this.authToken
        });
    };

    private initState = function(obj: {data: User, token: string}) {
        this.authToken = obj.token;
        this.me = obj.data;
        this.state = {
            userList: [{
                _id: this.me._id,
                username: 'Me'
            }],
            user: this.me,
            filter: {},
            expectedCaloriesClass: ''
        };

        localStorage.setItem('authToken', this.authToken);

        // get the meals 
        this.ajax('get', '/meals', null, 'meals');

        if(this.me.adminLevel >= 2) {
            // get the user list
            this.ajax('get', '/user/all', null, data => {
                this.state.userList = 
                    this.state.userList.concat(
                        data.filter(user => {
                            return user._id != this.me._id;
                        })
                    );
            });
        }
    }

    private recoverDates(obj: any): any  {
        if(obj instanceof Array) {
            obj.forEach(this.recoverDates);
        } else if(typeof obj == 'object') {
            for(let i in obj) {
                if(dateKeys.indexOf(i) != -1) {
                    let date = new Date(obj[i]);
                    if(!isNaN(date.getTime())) {
                        obj[i] = date;
                    }
                }
            }
            return obj;
        }
    }

    private handleError(error: any): Promise<any> {
        this.loadingReqs--;
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}