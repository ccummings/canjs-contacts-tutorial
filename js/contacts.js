steal('can/model', 'can/util/fixture', 'can/control', 'can/control/route', 'can/view/ejs', 'can/route',
function($){

	Contact = can.Model({
		findAll: 'GET /contacts',
		create  : "POST /contacts",
		update  : "PUT /contacts/{id}",
		destroy : "DELETE /contacts/{id}"
	},{});

	Contact.List = can.Model.List({
		filter: function(category){
			var contacts = new Contact.List([]);
			this.each(function(contact, i){
				if(category === 'all' || category === contact.category) {
					contacts.push(contact)
				}
			})
			return contacts;
		},
		count: function(category) {
			this.attr('length');
			return this.filter(category).length;
		}
	})

	var CONTACTS = [
		{
			id: 1,
			name: 'Justin',
			address: '1 CanJS Way',
			email: 'justin@bitovi.com',
			phone: '0123456789',
			category: 'co-workers'
		},
		{
			id: 2,
			name: 'Curtis',
			address: '1 CanJS Way',
			email: 'curtis@bitovi.com',
			phone: '0123456789',
			category: 'friends'
		},
		{
			id: 3,
			name: 'Brian',
			address: '1 CanJS Way',
			email: 'brian@bitovi.com',
			phone: '0123456789',
			category: 'family'
		}
	];

	can.fixture('GET /contacts', function(){
		return [CONTACTS];
	});

	// create
	var id= 4;
	can.fixture("POST /contacts", function(){
		// just need to send back a new id
		return {id: (id++)}
	})

	// update
	can.fixture("PUT /contacts/{id}", function(){
		// just send back success
		return {};
	})

	// destroy
	can.fixture("DELETE /contacts/{id}", function(){
		// just send back success
		return {};
	});

	Category = can.Model({
		findAll: 'GET /categories'
	},{});

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

	can.fixture('GET /categories', function(){
		return [CATEGORIES];
	});

	can.route( 'filter/:category' )
	can.route( '', { category: 'all' } )

	Contacts = can.Control({
		init: function(){
			this.render(can.route.attr('category'));
		},
		render: function(category){
			category = category || can.route.attr('category');
			this.filteredContacts = this.options.contacts.filter(category);
			this.element.html(can.view('contactsList', {
				contacts: this.filteredContacts,
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
				el.trigger('blur')
			}
		},
		'.contact select change': function(el, ev) {
			this.updateContact(el)
			this.render()
		},
		'.remove click': function(el, ev){
			el.closest('.contact').data('contact').destroy();
		},
		'filter/:category route': function( data ) {
			this.render(data.category);
		},
		'{Contact} created' : function(list, ev, contact){
			console.log('created', contact);
			this.options.contacts.push(contact);
			this.filteredContacts.push(contact);
		},
	})

	Create = can.Control({
		render: function() {
			this.contact = new Contact();
			this.element.html(can.view('createView', {
				contact: this.contact,
				categories: this.options.categories
			}));
		},
		show: function(){
			this.render();
			this.element.slideDown(200);
		},
		hide: function(){
			this.element.slideUp(200)
		},
		'{document} #new-contact click': function(){
			this.show();
		},
		createContact: function(el) {
			var name = this.element.find('[name="name"]').val();
			if(name !== "") {
				var address = this.element.find('[name="address"]').val(),
					phone = this.element.find('[name="phone"]').val(),
					email = this.element.find('[name="email"]').val(),
					category = this.element.find('[name="category"]').val();

				this.contact.attr({
					name: name,
					address: address,
					phone: phone,
					email: email,
					category: category
				}).save();
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
	})

	Filter = can.Control({
		init: function(){
			this.render();
		},
		render: function(){
			this.element.html(can.view('filterView', {
				contacts: this.options.contacts,
				categories: this.options.categories
			}));
			this.element.find('[data-category="' + (can.route.attr('category') || "all") + '"]').parent().addClass('active');
		},
		'[data-category] click': function(el, ev) {
			this.element.find('[data-category]').parent().removeClass('active');
			el.parent().addClass('active');
			can.route.attr('category', el.data('category'));
		},
		'{Contact} updated' : function(list, ev, item){
			this.render();
		},
		'{Contact} created' : function(list, ev, item){
			this.render();
		}
	})

	Category.findAll({}, function(categories){
		new Create('#create', {
			categories: categories
		});
		Contact.findAll({}, function(contacts){
			new Filter('#filter', {
				contacts: contacts,
				categories: categories
			})
			new Contacts('#contacts', {
				contacts: contacts,
				categories: categories
			})
		})
	});
	
})