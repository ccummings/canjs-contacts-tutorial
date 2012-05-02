Welcome to part 1 of a three-part tutorial on building a fully-functional contacts manager application in JavaScript using CanJS and jQuery. This tutorial will teach you everything you'll need to know to build your own JavaScript application using CanJS.

## Help Yourself Build JavaScript Applications

Building a JavaScript application without the right tools is difficult. While jQuery is great at what it does; a DOM manipulation library doesn't provide any infrastructure to build apps. This is why you need to use a library like CanJS.

CanJS is a lightweight MVC library that gives you the tools you need to build JavaScript apps. It provides all of the structure of the MVC (Model-View-Control) pattern plus templates with live data binding, routing and is memory safe (goodbye memory leaks!). It supports jQuery, Zepto, Mootools, YUI and Dojo and has a rich set of extensions and plugins.

Here's what's in store for you in part 1:

- Create a Control and a View (client-side template) to display a list of contacts
- Learn how to represent data in an application using Models, and
- See how to simulate ajax responses using the fixtures plugin

Excited? You should be, now let's get coding.

## Getting Started

You'll need to create a folder for your application. Inside this folder you need three subfolders: css, js and img. Your folder structure should look like this when you're done:

- contacts_manager
	- css
	- js
	- img

We'll start with the following HTML. Save this as `index.html`:

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

At the bottom of the page we load: jQuery, CanJS, the fixture plugin and our application code (`contacts.js`).

## Creating Views

Views are client-side templates that are used to render parts of our application. CanJS supports multiple templating languages, but we will be using EJS (Embedded JavaScript), which is packaged with CanJS and supports live binding.

EJS templates look like the HTML you want, but with magic tags where you want dynamic behavior (using JavaScript). There are three types of magic tags in EJS:

- `<% CODE %>`: Runs JavaScript code
- `<%= CODE %>`: Runs a JavaScript statement and writes the **escaped** result into the resulting HTML
- `<%== CODE %>`: Runs a JavaScript statement and writes the **unescaped** result into the resulting HTML

Templates can be loaded from a file, a string or a script tag. We will load our templates from script tags for this tutorial. Each script tag needs a unique id so it can be found easily and a type of `text/ejs`. Let's add our first two templates to `index.html` after the other script tags:

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

The `contactList` view will render the list of contacts passed to it. It uses the EJS `list()` helper to invoke a callback function on each contact in the list. The callback we've used here renders a contact using the `contactView` view. The `list()` helper isn't just a way to loop over a list, when used with an observable list, it will use live binding to re-run anytime the length of the list changes. This will update our UI automatically when we add or remove contacts.

The arrow syntax (`(el)-> el.data('contact', contact)`) in the magic tags of the `<li>` is an element callback. Everything after the arrow is executed with `el` being set to the current element. In this case, the element callback is adding the contact instance to the data of the `<li>`. You'll see why this is important a little later in the tutorial.

The `contactView` renders a single contact. Each piece of data is output in an input tag. While that does nothing for us now, later in this tutorial we'll use these for adding and updating a contact's information.

## Making Your Views Live

Throughout these views, it seems like we are using `.attr()` to read properties in some places but not others, what gives? Well, using `attr()` tells EJS that we want that piece of code to update automatically when the underlying data changes. This is called live binding. In EJS, live binding is opt-in, meaning we have to tell EJS what data should be updated when the underlying data is updated. If we use regular dot notation to access properties, they will not be live. Let's look at the name input from the `contactView` to see how this works:

```html
<input type="text" name="name" placeholder="Add Name" 
	<%= !contact.attr('name') ? "class='empty'" : "value='" + contact.name + "'" %>>
```

 When EJS encounters this template code, it will wrap the entire contents of the magic tags (`<%= %>`) in a function that will be called when the contact's name property is changed. That's why we don't need to use .attr('name') a second time here and can use `contact.name` instead.

## Creating Your First Control

A Control creates an organized, memory-leak free, stateful control that can be used to create widgets or organize application logic. You create an instance of a Control on a DOM element and pass in any data your Control will need. You can define any number of functions in your Control and bind to events. When the element your Control is bound to is removed from the DOM, the Control destroys itself, cleaning up any bound event listeners.

Creating a new Control is really straight forward. We simply use the `can.Control()` function and pass it an object containing functions and event bindings. 

Let's create the Control that will manage our list of contacts. Add this to your `contacts.js` file:

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

There are a few important variables and functions present in every Control instance:

- `this`: a reference to the Control instance
- `this.element`: the DOM element that you created your instance on
- `this.options`: an object containing any data you passed your instance when it was created
- `setup()`: binds event handlers and sets `this.element` and `this.options`
- `init()`: called when an instance is created
- `destory()`: called when theis instance is destroyed

The only thing we want to do when a `Contacts` instance is created, is render the list of contacts we pass into it. The `can.view()` function takes 2 parameters: the file, text or id of the script tag containing our template code and an object of data the view will use to render the HTML. Here we use the id `contactsList` and pass the list of contacts and the list of categories. Then we use jQuery's `.html()` function, which takes the document fragment returned by `can.view()` and populates the DOM element with the list of contacts.

## Modelling Your Data

A Model is how you represent data in your application. We'll need two models: one for contacts and one for categories. Add this code to `contacts.js`:

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

This creates two models: `Contact` and `Category`. A model has 5 static methods you can define to create, retrieve, update and delete data. They are `findAll`, `findOne`, `create`, `update` and `destroy`. You can overwrite these functions to work with any backend, but the easiest way to define a Model is using REST services like we have above.

Our models here are missing a few of the static methods I mentioned because we won't need those operations in this application and can safely ommit them.

It's important to point out here, that the model instances in CanJS are actually what we call 'observables'. In CanJS `can.Observe` provides the observable pattern for objects and `can.Observe.List` provides the observable pattern for arrays. This means you can get and set properties, using `attr()` and bind to property changes. 

When we use a Model's `findAll()` method, we are getting a `Model.List` which is a `can.Observe.List` that triggers events when an element is added, removed or updated.

## Simulating a REST Service Using Fixtures

Still with me? Great, because we are about to see how we can simulate ajax responses so we can build our JavaScript application without needing a backend.

Fixtures intercept ajax requests and simulate their response with a file or function. This is great for testing, prototyping or when the back-end isn't ready yet. We'll use fixtures to simulate a REST service that our Models are setup to use.

First though, we'll need some sample data for our application. Add this code to `contacts.js`:

```js
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
```

Now that we have data, we have to do something with it. We'll define our fixtures using the `can.fixture()` function, which takes two parameters. The first is the URL we want to intercept and the second is a file or function that is used to generate a response. We often want fixtures to intercept multiple URLs with one fixture so we use templated URLs. Just add `{}` to the URL where you want to match wilcards.

Add the following to `contacts.js`:

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

The first four fixtures simulate the `GET`, `POST`, `PUT` and `DELETE` ajax responses for the `Contact` model and the fifth fixture simulates the `GET` response for the `Category` model. We are using templated URLs so any REST requests containing an id get intercepted.

## Initializing The Application

Now that we have Models for our data, Views to render contacts and a Control to hook everything up, we need to kickstart this application.

Add this to your `contacts.js` file:

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

When the DOM is ready, we call `findAll()` on both of our models to retrieve all of the contacts and categories. Since `findAll()` returns a Deferred, we can use jQuery's `$.when()` to execute both requests in parllel. When both of these requests are complete, our callback function will be executed with the response of the two requests. These parameters are arrays, with the first index being the `Model.List` of model instances retrieved. In the callback, create a new instance of the `Contact` Control on the `#contacts` element and pass it the list of contacts and the list of categories.

## Summary

That's it for part 1 of this tutorial. You've been introduced to the core of CanJS: Models, Views and Controls. Models represent data in our applications, Views are templates that turn our data into HTML and Controls wire everything up.

In part 2, We'll create a Control and View to display the categories we have and learn how to use routing to filter our list of contacts. Hope to see you there.