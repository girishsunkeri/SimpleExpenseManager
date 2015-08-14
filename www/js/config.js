angular.module('sem.config', [])

.constant('DB_CONFIG', {
	name: 'DB_SEM',
	tables: [
		{
			name: 'Category',
			columns: [
				{ name: 'id', type: 'integer primary key' },
				{ name: 'title', type: 'text'}
			]
		},
		{
			name: 'Expense',
			columns: [
				{ name: 'id', type: 'integer primary key'},
				{ name: 'categoryId', type: 'integer'},
				{ name: 'cost', type: 'float'},
				{ name: 'date', type: 'datetime'}
			]
		}
	]
});