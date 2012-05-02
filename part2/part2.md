Welcome to part 2 of a three-part tutorial on building a fully-functional contacts manager application in JavaScript using CanJS and jQuery. In part 1, we created the Models, Views and Controls needed to display a list of contacts.

In this part of the tutorial, we're going to:

- Create a View and Control to display categories
- Learn how you can listen to events using Control, and
- See how to us routing to filter our list of contacts

We'll be adding to the the source files from part 1 so if you haven't done so already, go read part 1 to catch up, I'll be here when you're ready.

## Setting Up Routing

Routing helps manage browser history and client state in single page JavaScript applications. The hash in the URL contains properties that an application reads and updates and various parts of the app can listen to these changes and react accordingly, usually updatng parts of the current page without loading a new one.

In CanJS, routing is handled by `can.route`. It is a special observable that updates and responds to changes in `window.location.hash`. You can use `can.route` to map URLs to properties, resulting in pretty URLs like `#!/filter/all`. If no routes are provided, the hash value is just serialized into URL encoded notation like `#!&category=all`.

In our application, we will use routing to filter the list of contacts by category. Add the following code to your `contacts.js` file:

```js
can.route( 'filter/:category' )
can.route('', {category: 'all' })
```

The first line creates a route with a `category` property that we will be able to read and update. The next line creates a default route by setting the `category` property to `all`. 

When your application loads without a hash or with a hash that doesn't match our defined route, it will be set to `#!filter/all`. If you already have a hash that matches the route like `#!filter/friends`, the application will use that.

## Using Model.Lists

A `Model.List` is an observable array of model instances and is returned by a model's `findAll()` function. When you define a `Model` like `Contact`, a `Model.List` for that type of model is automatically created. We can extend this created `Model.List` to add helper functions that operate on a list of model instances. 

We are going to add two helper methods to `Contact.List` that will filter a list of contacts and tell us how many contacts are in each category. Add this to `contacts.js` immediately after the `Contact` model:

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

The two helper functions we have added are:

- `filter`: loops through each contact in the list and returns a new `Contact.List` of contacts within a category
- `count`: returns the number of contacts in a category using the `filter()` helper function

## Filtering the List of Contacts

Now we need to modify our `contactList` view to filter the list of contacts based on the current category propery in the hash. In the `contactList` view, change the parameter passed to the `list()` helper to `contacts.filter(can.route.attr('category')`. Your view should look like this when you're done:

```js
<script type="text/ejs" id="contactsList">
	<ul class="unstyled clearfix">
		<% list(contacts.filter(can.route.attr('category')), function(contact){ %>
			<li class="contact span8" <%= (el)-> el.data('contact', contact) %>>
				<div class="">
					<%== can.view.render('contactView', {contact: contact, categories: categories}) %>
				</div>
			</li>
		<% }) %>
	</ul>
</script>
```		

Here, we are calling the `filter()` helper function and passing in the current category from `can.route`. You may have noticed the `this.attr('length')` line in the `filter()` helper function. We put that there because we want the filtered list to automatically update if a contact is added or removed from the current filtered list. Since we are in a view, using `attr()` will tell EJS to make this filtered list live.

By now it should be clear how powerful live binding is. With a slight tweak to our View, our UI will now be completely in synch with not only our list of contacts, but with the category property defined in the route as well.

## Displaying Our Categories

Our contacts now get filtered when the category property in the URL hash is changed. What we need now, is a way to list all available categories and provide a way to change the hash.

First we'll create a new View to display a list of categories. Add this template to your `index.html` file below the other Views:

```html
<script type="text/ejs" id="filterView">
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
</script>
```

We use `$.each` to loop through each category and render a link with a `data-category` attribute along with the name of the category. We are using the `count()` helper from `Contact.List` to display how many contacts are in each category. Again, the `this.attr('length')` line in the `filter()` helper function will make this live so whenever a contact is removed or added from a category, the count will be updated automatically. We also add the name of the category to the `data-category` attribute of each link, so we can later retrieve it using `$.data('category')`.

Now we need to create the Control that will manage the list of categories. Add this code after the other Control in `contacts.js`:

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

The `init()` function of this Control looks a lot like the `Contact` Control from part 1. We are using the `filterView` view to render a list of categories and then add a class of 'active' to the current category.

The second function in our new Control is an event handler. It will listen for a `click` event on any element that matches the selector `[data-category]`, which is each category link in our view. When one of these links are clicked, the link will be marked as active and the category property in the hash will be updated using `can.route`. 

## Using Control To Listen To Events

Control automatically binds methods that look like event handlers when an instance is created. Take our example above for instance; the first part of the event handler is the selector and the second part is the event we are listening to. Control uses event delegation, so you don't have to worry about rebinding event listeners when the DOM changes.

Controls also support templated event handlers which make event handlers very flexible and powerful. All you need to do is substitute either the selector or the event name (or both) with a variable wrapped in `{}`. The Control will first look in `this.options` for the variable and then globally in the `window` object. This let's us customize the event a Control listens to and bind to events from elements outside of the Control. And these will all get cleaned up when the Control is destroyed, which is critical in avoiding memory leaks.

## Initializing the Filter Control

Just like the `Contacts` Control in part 1, we need to create a new instance of the `Filter` Control. Update your DOM ready function to look like this:

```js
$(function(){
	$.when(Category.findAll(), Contact.findAll()).then(function(categoryResponse, contactResponse){
		var categories = categoryResponse[0], 
			contacts = contactResponse[0];

		new Filter('#filter', {
			contacts: contacts,
			categories: categories
		});
		new Contacts('#contacts', {
			contacts: contacts,
			categories: categories
		});
	});
})
```

The only change here is that we create a instance of the `Filter` Control on the `#filter` element, passing in the list of contacts and categories.

## Summary

In this part of the tutorial, we added a new View and Control for displaying categories. We learned how to listen to events using a Control and we used routing to filter our list of contacts.

In the next and final part of this tutorial, we'll see how we can add, edit and delete contacts and save these changes in our models.