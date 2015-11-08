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



			var query2 = "INSERT INTO Category(title) SELECT 'Travel' WHERE NOT EXISTS(SELECT 1 FROM Category WHERE title = 'Travel')";
			self.query(query2);
			query2 = "INSERT INTO Category(title) SELECT 'Food' WHERE NOT EXISTS(SELECT 1 FROM Category WHERE title = 'Food')";
			self.query(query2);
			query2 = "INSERT INTO Category(title) SELECT 'Mobile' WHERE NOT EXISTS(SELECT 1 FROM Category WHERE title = 'Mobile')";
			self.query(query2);
			query2 = "INSERT INTO Category(title) SELECT 'Movie' WHERE NOT EXISTS(SELECT 1 FROM Category WHERE title = 'Movie')";
			self.query(query2);


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

		if(result.rows.length <= 0)
			return output;

	    output = angular.copy(result.rows.item(0));
	    console.log(output);
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

	self.allByFrequency = function(){
		return DB.query("SELECT c.id, title, COUNT(e.id) as e_Count FROM Category c LEFT JOIN" +
			 " Expense e on c.id = e.categoryId AND title != 'other' Group BY c.id Order by e_Count DESC, title")
				.then(function(result){
					return DB.getAll(result);
				})

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
		DB.query("DELETE FROM Expense WHERE categoryId = (?)", parameters);
		return DB.query("DELETE FROM Category WHERE id = (?)", parameters);
	};

	self.update = function(categoryTitle, categoryId){
		var parameters = [categoryTitle, categoryId];
		return DB.query("UPDATE Category SET title = (?) where id = (?)", parameters);
	};

	self.getByTitle = function(categoryTitle){
		var parameters = [categoryTitle];
		return DB.query("SELECT * FROM Category WHERE Title like (?)", parameters)
				.then(function(result){
					return DB.getById(result);
				});

	}

	return self;
})


.factory('Expense', function($cordovaSQLite, DB, Category, $filter, Settings){
	var self = this;

	self.all = function(){
		return DB.query("SELECT Expense.id as id, categoryId, cost, date, details, title FROM Expense INNER JOIN Category ON Expense.categoryId = Category.id")
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.allByCategoryId = function(categoryId, startDate, endDate){
		startDate = $filter('date')(startDate, 'yyyyMMdd');
		endDate = $filter('date')(endDate, 'yyyyMMdd');
		var parameters = [categoryId, startDate, endDate];
		return DB.query("SELECT id, categoryId, cost, date, substr(date,7)||substr(date,1,2)||substr(date,4,2) as newDate, details FROM Expense WHERE categoryId = (?) and newDate between (?) and (?)", parameters)
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.get = function(expenseId){
		var parameters = [expenseId];

		return DB.query("SELECT Expense.id as id, title, categoryId, cost, date, details FROM Expense INNER JOIN Category ON Expense.categoryId = Category.id WHERE Expense.id = (?)", parameters)
			.then(function(result){
				return DB.getById(result);
			});
	};

	self.getTotalCost = function(offsetDate){

		offsetDate = $filter('date')(offsetDate, 'yyyyMMdd'); 
		var endDate = new Date();
		endDate = $filter('date')(endDate, 'yyyyMMdd');
		var parameters = [offsetDate, endDate];
		console.log("Dates");
		console.log(offsetDate);
		console.log(endDate);
		return DB.query("SELECT SUM(cost) as totalCost, substr(date,7)||substr(date,1,2)||substr(date,4,2) as newDate FROM Expense WHERE newDate between (?) and (?)", parameters)
			.then(function(result){
				return DB.getById(result);
			});
	}

	self.add = function(cost, categoryId, date, details){

		if(!categoryId){
			Category.getByTitle('other')
				.then(function(result){
					if(result){
						categoryId = result.id;
						console.log("Existing id: "+ categoryId);

						console.log("Inserting categoryId: " + categoryId);
						var parameters = [cost, categoryId, date, details];
						return DB.query("INSERT INTO Expense (cost, categoryId, date, details) values (?,?,?,?)", parameters);
					}else{
						Category.add('other');
						Category.getByTitle('other')
							.then(function(result2){
								categoryId = result2.id;
								console.log("New id: "+ categoryId);

								console.log("Inserting categoryId: " + categoryId);
								var parameters1 = [cost, categoryId, date, details];
								return DB.query("INSERT INTO Expense (cost, categoryId, date, details) values (?,?,?,?)", parameters1);
							})
					}


				})
		}else{
			var parameters2 = [cost, categoryId, date, details];
			return DB.query("INSERT INTO Expense (cost, categoryId, date, details) values (?,?,?,?)", parameters2);
		}

		
	};

	self.remove = function(expenseId){
		var parameters = [expenseId];
		return DB.query("DELETE FROM Expense WHERE id = (?)", parameters);
	};

	self.update = function(expenseObj){
		var parameters = [expenseObj.categoryId, expenseObj.date, expenseObj.details, expenseObj.cost, expenseObj.id];
		return DB.query("UPDATE Expense SET categoryId = (?), date = (?), details = (?), cost = (?) where id = (?)", parameters);
	};

	return self;
})

.factory('Report', function($cordovaSQLite, DB, $filter){
	var self = this;

	self.getReport = function(){
		return DB.query("SELECT categoryId, SUM(cost) as totalCost, title FROM Expense INNER JOIN Category ON Expense.categoryId = Category.id Group By categoryId Order By totalCost Desc")
			.then(function(result){
				return DB.getAll(result);
			});
	};

	self.getReportByDate = function(startDate, endDate){
		startDate = $filter('date')(startDate, 'yyyyMMdd');
		endDate = $filter('date')(endDate, 'yyyyMMdd');
		var parameters = [startDate, endDate];
		console.log("startDate: "+startDate+" endDate: "+ endDate);
		return DB.query("SELECT categoryId, SUM(cost) as totalCost, title, substr(date,7)||substr(date,1,2)||substr(date,4,2) as newDate FROM Expense INNER JOIN Category ON Expense.categoryId = Category.id WHERE newDate between (?) and (?) Group By categoryId", parameters)
			.then(function(result){
				console.log(result);
				return DB.getAll(result);
			});
	};

	self.allByCategoryId = function(categoryId){
		var parameters = [categoryId];
		return DB.query("SELECT id, categoryId, cost, date, details FROM Expense WHERE categoryId = (?)", parameters)
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

.factory('Settings', function(DB){
	self.get = function(settingName){
		var parameters = [settingName];

		return DB.query("SELECT * FROM Settings WHERE SettingName = (?)", parameters)
			.then(function(result){
				return DB.getById(result);
			});
	};

	self.set = function(settingName, settingValue){
		var parameters = [settingValue, settingName];

		get(settingName).then(function(result){
			console.log(result);
			if(result){
				console.log("result");
				return DB.query("UPDATE Settings SET settingValue = (?) WHERE SettingName = (?)", parameters);
			}else{
				return add(settingName,settingValue);
			}
		})

		
	};

	self.add = function(settingName, settingValue){
		var parameters = [settingName, settingValue];
		return DB.query("INSERT INTO Settings (SettingName, settingValue) values (?, ?)", parameters);
	};

	return self;
})

.factory('User', function(){

})