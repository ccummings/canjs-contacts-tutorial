In this tutorial, we're going to continue building a contacts manager using CanJS and jQuery. In part one, we created the Models, Views and Controls needed to display a list of contacts.

In this part of the tutorial, we're going to learn how to filter our list of contacts by category using routing. We'll be adding to the the source files from part 1 so if you haven't done so already, go read part 1 to catch up, we'll be here when you're ready.

## Routing

Routing in CanJS is achieved using `can.route`. It is a special observable that updates and responds to changes in `window.location.hash`. `can.route` uses routes to translate URLs into property values giving you pretty URLs like `#!/filter/all`. If no routes are provided, it just serializes the route into URL encoded notation like `#!&category=all`.

In our application, we will use routing to filter the list of contacts by category. Add the following code to your `contacts.js` file:

```js
can.route( 'filter/:category' )
can.route('', {category: 'all' })
```

The first line creates a route with a `category` property that we will be able to read and update. The next line creates a default route by setting the `category` property to `all`. 

When your application loads without a hash or with a hash that doesn't match our defined route, it will be set to `#!filter/all`. If you already have a hash that matches our route like `#!filter/friends`, the application will use that.

## Using Model.Lists

A `Model.List` is an observable array of model instances and is returned by a model's `findAll()` function. When you define a `Model` like `Contact`, a `Model.List` for that type of model is automatically created. We can extend this created list to add helper functions that operate on a list of model instances of a specific type. We are going to add some helper methods to `Contact.List` that will filter a list of contacts and tell us how many contacts are in each category. Add this to `contacts.js` immediately after the `Contact` model:

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

- `filter`: loops through each contact in a list and returns a new `Contact.List` of contacts within a category
- `count`: returns the number of contacts in a category using the `filter()` helper function

## Filtering the List of Contacts

Now we need to modify our `contactList` view to filter the list of contacts based on the current hash. In the `contactList` view, change the parameter passed to the `list` helper to `contacts.filter(can.route.attr('category')`. Your view should look like this when you're done:

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

Here, we are calling the `filter()` helper function and passing in the current category from the route we defined. You may have noticed the `this.attr('length')` line in the `filter()` helper function. We put that there because we want the filtered list to automatically update if a contact is added or removed from the current filtered list. Since we are in a view, using `attr()` will tell EJS to make this filtered list live.

## Filter Control

Our contacts now get filtered when the category in the URL is changed. What we need now, is a way to list all available categories, how many contacts are in each and a way to change the hash. the `Filter` control will do all of that.

First we'll create the view for our new Control. Add this template to your `index.html` file below the other views:

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

We use `$.each` to loop through each category and render a link with a `data-category` attribute along with the name of the category. We are using the `count()` helper from `Contact.List` to display how many contacts are in each category. Again, the `this.attr('length')` line in the `filter()` helper function will make this live so whenever a contact is removed or added from a category, the count will be updated.

Now add this code after the other Controls in `contacts.js`:

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

This Control renders the list of categories using the `filterView` template. We also bind to a click on any of the links iside the view. The click handler marks the link that was clicked as active by adding a class to its `<li>` and then updates the category in the route. This will change the hash, which will cause the `Contact` controller to re-render the list of contacts.

To create an instance of the `Filter` Control, we add this code to `contacts.js` just after we create the `Contacts` instance. Your DOM ready function should look like this:

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

## Summary

In this tutorial we added filtering to our contacts application and using can.route`.

We saw how live binding can be used to keep our UI in synch with our data. We also learned how to add helper functions to a `Model.List` and explored how route data can be read and updated using `can.route`. 

In the next part of this tutorial, we'll see how we can edit and delete contacts and save these changes in our models.