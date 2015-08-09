angular.module('sem.services', ['sem.utils'])

.factory('UI', function(){
	
	var o = {
		showBackButton: false,
		backButtonUrl: 'app.dashboard'
	};

	o.setBackButtonSettings = function(status, url){
		o.showBackButton = status;
	}

	o.backButtonStatus = function(){
		return o.showBackButton;
	}

	return o;
})

.factory('Categories', function(){

	var o = {
		types: []
	};

	o.newCategory = function(categoryTitle){
		return { title: categoryTitle, id: o.types.length };
	};

	o.addNewCategory = function(categoryTitle){

		console.log("categoryTitle: " + categoryTitle);
		if(!categoryTitle){
			return false;
		}

		console.log("Adding new category: " + categoryTitle);
		o.types.push(o.newCategory(categoryTitle));
		console.log("Existing: " + o.types);
	};

	o.allCategories = function(){
		return o.types;
	};

	return o;
})

.factory('User', function(){
	var o = {
		expenses: []
	}

	o.newExpense = function(cost, categoryId, date){
		return { cost: cost, categoryId: categoryId, date: date };
	}

	o.addExpense = function(cost, categoryId, date){

		console.log("Adding new expense " + cost + " for " + categoryId);
		o.expenses.push(o.newExpense(cost, categoryId, date));
		console.log("All expense: " + o.expenses);
	}

	return o;
})