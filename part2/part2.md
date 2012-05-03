This is part two of a three part tutorial that will teach you how to build a contacts manager application in JavaScript using CanJS and jQuery. When you're done with this tutorial, you'll have all you need to build your own JavaScript applications using CanJS.

In part one, you created the Models, Views and Controls needed to display contacts and used fixtures to simulate a REST service.

In this part of the tutorial, you will:

- Create a Control and View to display categories
- Listen to events using a Control
- Use routing to filter contacts

You'll be adding to the source files from part one so if you haven't done so already, go catch up by reading part one. I'll be here when you're ready.

## Setting Up Routing

Routing helps manage browser history and client state in single page JavaScript applications. The hash in the URL contains properties that an application reads and writes. Various parts of the app can listen to these changes and react accordingly, usually updating parts of the current page without loading a new one.

`can.route` is a special observable that updates and responds to changes in `window.location.hash`. Use `can.route` to map URLs to properties, resulting in pretty URLs like `#!filter/all`. If no routes are defined, the hash value is just serialized into URL encoded notation like `#!category=all`.

In this application, routing will be used to filter contacts by category. Add the following code to your `contacts.js` file:

```js
can.route( 'filter/:category' )
can.route('', {category: 'all' })
```

The first line creates a route with a `category` property that your application will be able to read and write. The second line creates a default route, that sets the `category` property to `all`.

## Working with a List of Model Instances

A `Model.List` is an observable array of model instances. When you define a `Model` like `Contact`, a `Model.List` for that type of Model is automatically created. We can extend this created `Model.List` to add helper functions that operate on a list of model instances. 

`Contact.List` will need two helper functions to filter a list of contacts and report how many contacts are in each category. Add this to `contacts.js` immediately after the `Contact` model:

```js
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
```

The two helper functions here are:

- `filter()` loops through each contact in the list and returns a new `Contact.List` of contacts within a category. `this.attr('length')` is included here so EJS will setup live binding when we use this helper in a view.
- `count()` returns the number of contacts in a category using the `filter()` helper function. Because of `this.attr('length')` in `filter()`, EJS will setup live binding when we use this helper in a view. 

## Filtering the List of Contacts

Next, you'll modify the `contactsList.ejs` view to filter contacts based on the category property in the hash. In the `contactsList.ejs` view, change the parameter passed to the `list()` helper to `contacts.filter(can.route.attr('category'))`. Your EJS file should look like this when you're done:

```html
<ul class="unstyled clearfix">
	<% list(contacts.filter(can.route.attr('category')), function(contact){ %>
		<li class="contact span8" <%= (el)-> el.data('contact', contact) %>>
			<div class="">
				<%== can.view.render('contactView', {contact: contact, categories: categories}) %>
			</div>
		</li>
	<% }) %>
</ul>
```		

On line 2, `filter()` is called with the current category from `can.route`. Since you used `attr()` in `filter()` and on `can.route`, EJS will setup live binding to re-render your UI when either of these change.

By now it should be clear how powerful live binding is. With a slight tweak to your view, the UI of the app will now be completely in sync with not only the list of contacts, but with the category property defined in the route as well.

## Displaying Categories

Contacts are filtered when the category property in the hash is changed. Now you need a way to list all available categories and change the hash.

First, create a new View to display a list of categories. Save this code as `filterView.ejs` in your views folder:

```html
<ul class="nav nav-list">
	<li class="nav-header">Categories</li>
	<li>
		<a href="javascript://" data-category="all">All (<%= contacts.count('all') %>)</a>
	</li>
	<% $.each(categories, function(i, category){ %>
		<li>
			<a href="javascript://" data-category="<%= category.data %>"><%= category.name %> (<%= contacts.count(category.data) %>)</a>
		</li>
	<% }) %>
</ul>
```

Let's go over what's going on in this code:

- **Line 6**: `$.each` loops through the categories and renders them each as a link
- **Line 8**: The link has a `data-category` attribute that will be pulled into jQuery's data object. Later, this value can be accessed using `.data('category')` on the `<a>`. `count()` is used to display the number of contacts in each category. Live binding is setup on this because `filter()` uses `this.attr('length')`.

## Using Control To Listen To Events

Control automatically binds methods that look like event handlers when an instance is created. The first part of the event handler is the selector and the second part is the event we are listening to. Control uses event delegation, so you don't have to worry about rebinding event listeners when the DOM changes.

Now you need to create the Control that will manage categories. Add this code after the `Contacts` Control in `contacts.js`:

```js
Filter = can.Control({
	init: function(){
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
	}
});
```

- **Line 3-6**: Like in the `Contacts` Control, `init()` uses `can.view()` to render categories and `html()` to insert it in to the Control's element.
- **Line 7**: Finds the link that corresponds to the current category adds a class of 'active' to its parent element.
- **Line 8**: Listens for a `click` event on any element matching the selector `[data-category]`
- **Line 9-10**: Adds the 'active' class to the link that was clicked.
- **Line 11**: Updates the category property in `can.route` using the value from jQuery's data object for the `<a>` that was clicked 

## Initializing the Filter Control

Just like the `Contacts` Control in part one, you need to create a new instance of the `Filter` Control. Update your document ready function to look like this:

```js
$(document).ready(function(){
	$.when(Category.findAll(), Contact.findAll()).then(function(categoryResponse, contactResponse){
		var categories = categoryResponse[0], 
			contacts = contactResponse[0];

		new Contacts('#contacts', {
			contacts: contacts,
			categories: categories
		});
		new Filter('#filter', {
			contacts: contacts,
			categories: categories
		});
	});
})
```

With this change, an instance of the `Filter` Control will be created on the `#filter` element. It will be passed the list of contacts and categories.

## Summary

That's all for part two. Here's what you accomplished:

- Created a Control that listens to events and manages categories
- Setup routing to filter contacts by category
- Tweaked your views so live binding will keep your entire UI in sync with your data layer

In part three, you'll update your existing Controls to allow contacts to be edited and deleted. You'll also create a new Control and View to that enables you to add new contacts.