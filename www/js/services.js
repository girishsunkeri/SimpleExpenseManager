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
				self.query(query);
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

	self.getByTitle = function(categoryTitle){
		var parameters = [categoryTitle];
		return DB.query("SELECT * FROM Category WHERE Title = (?)", parameters)
				.then(function(result){
					return DB.getById(result);
				});

	}

	return self;
})


.factory('Expense', function($cordovaSQLite, DB, Category){
	var self = this;

	self.all = function(){
		return DB.query("SELECT categoryId, cost, date, title FROM Expense INNER JOIN Category ON Expense.categoryId = Category.id")
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.allByCategoryId = function(categoryId){
		var parameters = [categoryId];
		return DB.query("SELECT id, categoryId, cost, date FROM Expense WHERE categoryId = (?)", parameters)
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.get = function(expenseId){
		var parameters = [expenseId];

		return DB.query("SELECT id, categoryId, cost, date FROM Expense WHERE id = (?)", parameters)
			.then(function(result){
				return DB.getById(result);
			});
	};

	self.add = function(cost, categoryId, date){

		if(!categoryId){
			var otherCategory = Category.getByTitle('other');
			if(otherCategory == undefined){
				categoryId = otherCategory.id;
			}else{
				Category.add('other');
				categoryId = Category.getByTitle('other').id;
			}
		}

		var parameters = [cost, categoryId, date];
		return DB.query("INSERT INTO Expense (cost, categoryId, date) values (?,?,?)", parameters);
	};

	self.remove = function(expenseId){
		var parameters = [expenseId];
		return DB.query("DELETE FROM Expense WHERE id = (?)", parameters);
	};

	self.update = function(oldExpense, newExpense){
		var parameters = [newExpense.title, oldExpense.id];
		return DB.query("UPDATE Expense SET title = (?) where id = (?)", parameters);
	};

	return self;
})

.factory('Report', function($cordovaSQLite, DB){
	var self = this;

	self.getReport = function(){
		return DB.query("SELECT categoryId, SUM(cost) as totalCost, title FROM Expense INNER JOIN Category ON Expense.categoryId = Category.id Group By categoryId")
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.allByCategoryId = function(categoryId){
		var parameters = [categoryId];
		return DB.query("SELECT id, categoryId, cost, date FROM Expense WHERE categoryId = (?)", parameters)
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.get = function(expenseId){
		var parameters = [expenseId];

		return DB.query("SELECT id, categoryId, cost, date FROM Expense WHERE id = (?)", parameters)
			.then(function(result){
				return DB.getById(result);
			});
	};

	self.add = function(cost, categoryId, date){
		var parameters = [cost, categoryId, date];
		return DB.query("INSERT INTO Expense (cost, categoryId, date) values (?,?,?)", parameters);
	};

	self.remove = function(expenseId){
		var parameters = [expenseId];
		return DB.query("DELETE FROM Expense WHERE id = (?)", parameters);
	};

	self.update = function(oldExpense, newExpense){
		var parameters = [newExpense.title, oldExpense.id];
		return DB.query("UPDATE Expense SET title = (?) where id = (?)", parameters);
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
		o.expenses.push(o.newExpense(cost, categoryId, date));
	}

	return o;
})