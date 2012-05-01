In this tutorial, we're going to build a contacts manager using CanJS and jQuery. We'll walk through the basics of CanJS' and its empowering API.

In this part of the tutorial, we're going to learn how to use models to represent our application data. We'll be creating some mock data and simulating a backend REST server with fixtures and we'll create our first views and controls to display a list of contacts.

## What is CanJS?

[CanJS](http://canjs.us) is a client-side MVC library featuring live binding templates, routes, integration with five major JS libraries, blazing performance, and a tiny size (8.5KB). It also includes a rich set of supported extensions and plugins.

## Getting Started

To start we will need to create a root project folder to put all of our code. Inside this root folder, create three subfolders: css, js and img. your folder structure should look like this:

- [root]
	- css
	- js
	- img

Save the following HTML as `index.html` in your root folder:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>CanJS Contacts Manager</title>
		<link rel="stylesheet" href="css/bootstrap.min.css">
		<link rel="stylesheet" href="css/contacts.css">
	</head>
	<body>
		<div class="container">
			<div class="row">
				<div class="span12">
					<h1>Contacts Manager</h1>
				</div>
			</div>
			<div class="row">
				<div class="span3">
					<div class="well">
						<nav id="filter"></nav>
					</div>
				</div>
				<div class="span9">
					<div id="create"></div>
					<div id="contacts"></div>
				</div>
			</div>
		</div>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.js"></script>
		<script src="js/can.jquery.min.js"></script>
		<script src="js/can.fixture.js"></script>
		<script src="js/contacts.js"></script>
	</body>
</html>
```

We will be using the jQuery distribution of CanJS, so we need to include jQuery in our page as well as CanJS. We also need a way to simulate ajax requests, which is what the fixture plugin for CanJS does, so we'll include that too. Our application code will all be in the `contacts.js` file. We'll also be using Bootstrap from Twitter for its base styles along with some custom CSS for our application, which will be in `contacts.css`.

Now to the coding. In a new file add the following:

```js
(function($){
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
})(jQuery)
```

Save this in the js folder as `contacts.js`. These arrays of objects are sample data for our application. We will be using the CanJS fixture plugin to simulate a back-end using this sample data.

## Models

A model is how you represent data in your application. We need two models: one for contacts and one for categories. Add this code directly below the arrays in `contacts.js`:

```js
Contact = can.Model({
	findAll: 'GET /contacts',
	create  : "POST /contacts",
	update  : "PUT /contacts/{id}",
	destroy : "DELETE /contacts/{id}"
},{});

Category = can.Model({
	findAll: 'GET /categories'
},{});
```

This creates two models: `Contact` and `Category`. A model has 5 static methods you can use to create, retrieve, update and delete data. They are `findAll`, `findOne`, `create`, `update` and `destroy`. 

While it's possible to make our models work with any sort of backend, we have defined our models as if they were going to use a RESTful JSON backend. A few of the static methods I mentioned are missing from our modesl because we don't need those operations in this application.

It's important to point out here, that the model instances in CanJS are actually observables. In CanJS `can.Observe` provides the observable pattern for JavaScript objects. This means you can get and set properties, using `attr` and bind to property changes. When we use `findAll`, we are getting a `Model.List` which inherits `can.Observe.List`, which provides the obervable pattern for JavaScript arrays. A `Model.List` will fire events when an element is added, removed or updated.

## Fixtures

Of course, we don't have a server to make requests to. That's where the fixtures plugin comes in handy.

Fixtures intercept ajax requests and simulate their response with a file or function. This allows you to run your application independently of any back-end, which is invaluable for prototyping, testing or when the back-end is not ready yet.

Add the following code to `contacts.js`, after the model definitions:

```js
can.fixture('GET /contacts', function(){
	return [CONTACTS];
});

var id= 4;
can.fixture("POST /contacts", function(){
	return {id: (id++)}
});

can.fixture("PUT /contacts/{id}", function(){
	return {};
});

can.fixture("DELETE /contacts/{id}", function(){
	return {};
});

can.fixture('GET /categories', function(){
	return [CATEGORIES];
});
```

The first parameter to `can.fixture` is the URL we want to intercept and the second is a file or function that is used to generate a response. Often we want fixtures to intercept multiple URLs with one fixture so we use templated URLs. To use them, just add `{}` to the URL where you want to match wilcards.

The first four fixtures simulate the `GET`, `POST`, `PUT` and `DELETE` ajax requests we will make from our `Contact` model and the fifth fixture is for the `GET` request from the `Category` model. We are using templated URLs so any REST requests containing an id get intercepted.

## Views

Views are client-side templates that are used to render parts of our application. CanJS support multiple templating languages, but we will use EJS, which is packaged with CanJS and supports live-binding. 

EJS templates look like the HTML you want, but with magic tags where you want dynamic behavior (via JavaScript). There are three types of magic tags in EJS:

- `<% CODE %>`: Runs JavaScript code
- `<%= CODE %>`: Runs a JavaScript statement and writes the *escaped* result into the resulting HTML
- `<%== CODE %>`: Runs a JavaScript statement and writes the *unescaped* result into the resulting HTML

Templates can be loaded from a file, string or script tag. We will load our templates from script tags for this tutorial. Each script tag needs a unique id so it can be easily found and a type of `text/ejs`. Let's add our first two templates to `index.html` file just before the other script tags:

```html
<script type="text/ejs" id="contactsList">
	<ul class="unstyled clearfix">
		<% list(contacts, function(contact){ %>
			<li class="contact span8" <%= (el)-> el.data('contact', contact) %>>
				<div class="">
					<%== can.view.render('contactView', {contact: contact, categories: categories}) %>
				</div>
			</li>
		<% }) %>
	</ul>
</script>
<script type="text/ejs" id="contactView">
	<a href="javascript://" class="remove"><i class="icon-remove"></i></a>
	<form>
		<div class="row">
			<div class="span2">
				<img src="img/contact.png" width="100" height="100">
			</div>
			<div class="span3">
				<input type="text" name="name" placeholder="Add Name" 
					<%= !contact.attr('name') ? "class='empty'" : "value='" + contact.name + "'" %>>
				<select name="category">
					<% $.each(categories, function(i, category){ %>
						<option value="<%= category.data %>" <%= contact.category === category.data ? "selected" : "" %>>
							<%= category.name %>
						</option>
					<% }) %>
				</select>
			</div>
			<div class="span3">
				<label>Address</label>
				<input type="text" name="address" 
					<%= !contact.attr('address') ? "class='empty'" : "value='" + contact.address + "'" %>>
				<label>Phone</label>
				<input type="text" name="phone" 
					<%= !contact.attr('phone') ? "class='empty'" : "value='" + contact.phone + "'" %>>
				<label>Email</label>
				<input type="text" name="email" 
					<%= !contact.attr('email') ? "class='empty'" : "value='" + contact.email + "'" %>>
			</div>
		</div>
	</form>
</script>
```

The `contactList` view is what will render a list of contacts. It uses the EJS `list` helper to invoke a callback function on each item in the list. The callback we've used here renders the `contactView` template for each of our contacts. The `list` helper isn't just a way to loop over a list, it is used specifically for observable lists and will be re-run anytime the length of the list changes. This will be useful when we start adding and removing contacts in our application because our view HTML will update automatically.

The arrow syntax in the magic tags of the li is an element callback. Everything after the arrow is executed with `el` being set to the element containing the magic tags. In this case, the element callback is adding the contact information to the data of the li. You'll see why this is important a little later in the tutorial.

The `contactView` renders a single contact. Each piece of data is output in an input tag. While that does nothing for us now, later in this tutorial series we'll use these for adding and updating information. There is a remove link that we will also use later. The rest of the template is just HTML used to make a contact look pretty.

Throughout this view, it seems like we are using `.attr()` to read properties in some places but not others, what gives? In EJS, live binding is opt-in, meaning we have to tell EJS what data should be updated when the underlying data is updated. Using `attr()` tells EJS just that. If you just use regular dot notation to access properties of your model, they will not be live. Let's examine the code from the name input to see how this works:

```html
<input type="text" name="name" placeholder="Add Name" 
	<%= !contact.attr('name') ? "class='empty'" : "value='" + contact.name + "'" %>>
```

 When EJS encounters this template code, it will wrap the entire contents of the magic tags in a function that will be called when the contact's name property is updated. This means the entire statement will be re-run and our template will update to reflect the changes. That's why we don't need to use .attr('name') a second time here and can use `contact.name` instead.

## Controls

In CanJS, a Control creates an organized, memory-leak free, stateful control. They can be used to create widgets or organize your applications logic. You create an instance of a Control on a DOM element and pass in any data your Control needs. You can define any number of functions in your Control and bind to events. When the element your Control is bound to is removed from the DOM, the Control destroys itself, cleaning up any bound event listeners, hence memory-leak free.

To hook up our models and views to render a list of contacts we'll create a `Contacts` Control. Add this to your `contacts.js` file below the fixtures:

```js
Contacts = can.Control({
	init: function(){
		this.element.html(can.view('contactsList', {
			contacts: this.options.contacts,
			categories: this.options.categories
		}));
	}
})
```

This Control will manage our list of contacts. The first time a Control instance is created, the `init()` function will be called. Our `init()` function renders the list of contacts using the `contactList` view we created earlier. 

## Initialisation

Now that we have a Control to tie things together, we need to create an instance of it to display our contacts. Add this to your `contacts.js` file:

```js
$(function(){
	$.when(Category.findAll(), Contact.findAll()).then(function(categoryResponse, contactResponse){
		var categories = categoryResponse[0], 
			contacts = contactResponse[0];

		new Contacts('#contacts', {
			contacts: contacts,
			categories: categories
		});
	});
})
```

When the DOM is ready, we call `findAll()` on both of our models. Since `findAll()` returns a Deferred, we can use jQuery's `$.when()` to execute both requests in parllel and execute a callback when they are both complete.

The parameters passed to the callback function are the results of the two ajax requests. These parameters are arrays, with the first index being the list of model instances retrieved. In the callback, we create a new instance of the `Contact` Control on the `#contacts` element.

## Summary

In this tutorial, we've been introduced to the core of CanJS: Models, Views and Controls. Models are classes that are used to represent data in our applications. Views turn our data into HTML and Controls wire everything up.

In the next part of this tutorial series, we'll learn how to filter our list of contacts by category using Routing in CanJS.