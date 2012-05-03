(function(){
	var CONTACTS = [
		{
			id: 1,
			name: 'William',
			address: '1 CanJS Way',
			email: 'william@husker.com',
			phone: '0123456789',
			category: 'co-workers'
		},
		{
			id: 2,
			name: 'Laura',
			address: '1 CanJS Way',
			email: 'laura@starbuck.com',
			phone: '0123456789',
			category: 'friends'
		},
		{
			id: 3,
			name: 'Lee',
			address: '1 CanJS Way',
			email: 'lee@apollo.com',
			phone: '0123456789',
			category: 'family'
		}
	];

	var CATEGORIES = [
		{
			id: 1,
			name: 'Family',
			data: 'family'
		},
		{
			id: 2,
			name: 'Friends',
			data: 'friends'
		},
		{
			id: 3,
			name: 'Co-workers',
			data: 'co-workers'
		}
	];
	
	Contact = can.Model({
		findAll: 'GET /contacts',
		create  : "POST /contacts",
		update  : "PUT /contacts/{id}",
		destroy : "DELETE /contacts/{id}"
	},{});

	Category = can.Model({
		findAll: 'GET /categories'
	},{});

	can.fixture('GET /contacts', function(){
		return [CONTACTS];
	});

	// create
	var id= 4;
	can.fixture("POST /contacts", function(){
		// just need to send back a new id
		return {id: (id++)}
	});

	// update
	can.fixture("PUT /contacts/{id}", function(){
		// just send back success
		return {};
	});

	// destroy
	can.fixture("DELETE /contacts/{id}", function(){
		// just send back success
		return {};
	});

	can.fixture('GET /categories', function(){
		return [CATEGORIES];
	});

	Contacts = can.Control({
		init: function(){
			this.element.html(can.view('views/contactsList.ejs', {
				contacts: this.options.contacts,
				categories: this.options.categories
			}));
		}
	});

	$(document).ready(function(){
		$.when(Category.findAll(), Contact.findAll()).then(function(categoryResponse, contactResponse){
			var categories = categoryResponse[0], 
				contacts = contactResponse[0];

			new Contacts('#contacts', {
				contacts: contacts,
				categories: categories
			});
		});
	});
})()