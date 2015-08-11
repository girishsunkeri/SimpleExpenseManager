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
			name: 'List',
			columns: [
				{ name: 'id', type: 'integer primary key'},
				{ name: 'categoryId', type: 'integer'},
				{ name: 'title', type: 'text'}
			]
		},
		{
			name: 'Item',
			columns: [
				{ name: 'id', type: 'integer primary key'},
				{ name: 'categoryId', type: 'integer'},
				{ name: 'cost', type: 'text'},
				{ name: 'date', type: 'text'}
			]
		}
	]
});