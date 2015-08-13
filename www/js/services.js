angular.module('sem.services', ['sem.utils', 'sem.config', 'ngCordova'])

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

.factory('DB', function($q, DB_CONFIG, $cordovaSQLite, $ionicPlatform){
	var self = this;
	self.db = null;

	self.init = function(){

		try{
			if(window.cordova){
				self.db = $cordovaSQLite.openDB("myapp.db");
			}else{
				//TODO what exactly remaining parameters are for?
				self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
			}

			angular.forEach(DB_CONFIG.tables, function(table){
				var columns = [];

				angular.forEach(table.columns, function(column){
					columns.push(column.name + ' ' + column.type);
				});

				var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
				console.log(query);
				self.query(query);
				console.log('Table ' + table.name + ' initialized');
			});
		}catch(e){
			alert(e);
		}
	};

	self.query = function(query, parameters){
		try{
			parameters = parameters || [];
			var q = $q.defer();

			$ionicPlatform.ready(function () {
				$cordovaSQLite.execute(self.db, query, parameters)
					.then(function(result){
						q.resolve(result);
					}, function(error){
						console.log(error);
						q.reject(error);
					});
			});
		}catch(e){
			alert(e);
		}

		return q.promise;
	};

	self.getAll = function(result){
		var output = [];

		for(var i = 0; i < result.rows.length; i++){
			output.push(result.rows.item(i));
		}

		console.log("output:");
		console.log(JSON.stringify(output));

		return output;
	};

	// Proces a single result
	self.getById = function(result) {
		var output = null;
	    output = angular.copy(result.rows.item(0));
	    return output;
	};

	return self;
})

.factory('Category', function($semLocalStorage, $cordovaSQLite, DB){
	var self = this;

	self.all = function(){
		return DB.query("SELECT id, title FROM Category")
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.get = function(categoryId){
		var parameters = [categoryId];

		return DB.query("SELECT id, title FROM Category WHERE id = (?)", parameters)
			.then(function(result){
				return DB.getById(result);
			});
	};

	self.add = function(categoryTitle){
		var parameters = [categoryTitle];
		return DB.query("INSERT INTO Category (title) values (?)", parameters);
	};

	self.remove = function(categoryId){
		var parameters = [categoryId];
		return DB.query("DELETE FROM Category WHERE id = (?)", parameters);
	};

	self.update = function(oldCategory, newCategory){
		var parameters = [newCategory.title, oldCategory.id];
		return DB.query("UPDATE Category SET title = (?) where id = (?)", parameters);
	};


	self.init = function(){
		DB.query("INSERT INTO Category (title) values (?)", ['Shopping']);
		DB.query("INSERT INTO Category (title) values (?)", ['Chores']);
		DB.query("INSERT INTO Category (title) values (?)", ['School']);
	};

	return self;
})


.factory('Item', function($cordovaSQLite, DB){
	var self = this;

	self.all = function(){
		console.log("getting item");
		return DB.query("SELECT categoryId, cost, date, title FROM Item INNER JOIN Category ON Item.categoryId = Category.id")
			.then(function(result){
				console.log(result);
				return DB.getAll(result);
			});
	};

	self.allByCategoryId = function(categoryId){
		var parameters = [categoryId];
		return DB.query("SELECT id, categoryId, cost, date FROM Item WHERE categoryId = (?)", parameters)
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.get = function(itemId){
		var parameters = [itemId];

		return DB.query("SELECT id, categoryId, cost, date FROM Item WHERE id = (?)", parameters)
			.then(function(result){
				return DB.getById(result);
			});
	};

	self.add = function(cost, categoryId, date){
		var parameters = [cost, categoryId, date];
		console.log(cost + " " + categoryId + " " + date);
		return DB.query("INSERT INTO Item (cost, categoryId, date) values (?,?,?)", parameters);
	};

	self.remove = function(itemId){
		var parameters = [itemId];
		return DB.query("DELETE FROM Item WHERE id = (?)", parameters);
	};

	self.update = function(oldItem, newItem){
		var parameters = [newItem.title, oldItem.id];
		return DB.query("UPDATE Item SET title = (?) where id = (?)", parameters);
	};

	return self;
})

.factory('Report', function($cordovaSQLite, DB){
	var self = this;

	self.getReport = function(){
		console.log("getting report items");
		return DB.query("SELECT categoryId, SUM(cost) as totalCost, title FROM Item INNER JOIN Category ON Item.categoryId = Category.id Group By categoryId")
			.then(function(result){
				console.log(result);
				return DB.getAll(result);
			});
	};

	self.allByCategoryId = function(categoryId){
		var parameters = [categoryId];
		return DB.query("SELECT id, categoryId, cost, date FROM Item WHERE categoryId = (?)", parameters)
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.get = function(itemId){
		var parameters = [itemId];

		return DB.query("SELECT id, categoryId, cost, date FROM Item WHERE id = (?)", parameters)
			.then(function(result){
				return DB.getById(result);
			});
	};

	self.add = function(cost, categoryId, date){
		var parameters = [cost, categoryId, date];
		console.log(cost + " " + categoryId + " " + date);
		return DB.query("INSERT INTO Item (cost, categoryId, date) values (?,?,?)", parameters);
	};

	self.remove = function(itemId){
		var parameters = [itemId];
		return DB.query("DELETE FROM Item WHERE id = (?)", parameters);
	};

	self.update = function(oldItem, newItem){
		var parameters = [newItem.title, oldItem.id];
		return DB.query("UPDATE Item SET title = (?) where id = (?)", parameters);
	};

	return self;
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