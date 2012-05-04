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

	Contact.List = can.Model.List({
		filter: function(category){
			this.attr('length');
			var contacts = new Contact.List([]);
			this.each(function(contact, i){
				if(category === 'all' || category === contact.attr('category')) {
					contacts.push(contact)
				}
			})
			return contacts;
		},
		count: function(category) {
			return this.filter(category).length;
		}
	});

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

	can.route( 'filter/:category' );
	can.route( '', { category: 'all' } );

	Contacts = can.Control({
		init: function(){
			this.element.html(can.view('views/contactsList.ejs', {
				contacts: this.options.contacts,
				categories: this.options.categories
			}));
		},
		updateContact: function(el){
			var contact = el.closest('.contact').data('contact');
			contact.attr(el.attr('name'), el.val()).save();
		},
		'.contact input focusout': function(el, ev) {
			this.updateContact(el);
		},
		'.contact input keyup': function(el, ev) {
			if(ev.keyCode == 13){
				el.trigger('blur');
			}
		},
		'.contact select change': function(el, ev) {
			this.updateContact(el);
		},
		'.remove click': function(el, ev){
			el.closest('.contact').data('contact').destroy();
		},
		'{Contact} created' : function(list, ev, contact){
			this.options.contacts.push(contact);
		}
	});

	Create = can.Control({
		show: function(){
			this.contact = new Contact();
			this.element.html(can.view('views/createView.ejs', {
				contact: this.contact,
				categories: this.options.categories
			}));
			this.element.slideDown(200);
		},
		hide: function(){
			this.element.slideUp(200);
		},
		'{document} #new-contact click': function(){
			this.show();
		},
		createContact: function() {
			var form = this.element.find('form');
				values = can.deparam(form.serialize());
				
			if(values.name !== "") {
				this.contact.attr(values).save();
				this.hide();
			}
		},
		'.contact input keyup': function(el, ev) {
			if(ev.keyCode == 13){
				this.createContact(el);
			}
		},
		'.save click' : function(el){
			this.createContact(el)
		},
		'.cancel click' : function(){
			this.hide();
		}
	});

	Filter = can.Control({
		init: function(){
			var category = can.route.attr('category') || "all";
			this.element.html(can.view('views/filterView.ejs', {
				contacts: this.options.contacts,
				categories: this.options.categories
			}));
			this.element.find('[data-category="' + category + '"]').parent().addClass('active');
		},
		'[data-category] click': function(el, ev) {
			this.element.find('[data-category]').parent().removeClass('active');
			el.parent().addClass('active');
			can.route.attr('category', el.data('category'));
		}
	});

	$(document).ready(function(){
		$.when(Category.findAll(), Contact.findAll()).then(function(categoryResponse, contactResponse){
			var categories = categoryResponse[0], 
				contacts = contactResponse[0];

			new Create('#create', {
				categories: categories
			});
			new Filter('#filter', {
				contacts: contacts,
				categories: categories
			});
			new Contacts('#contacts', {
				contacts: contacts,
				categories: categories
			});
		});
	});
})();