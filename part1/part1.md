This is part one of the three part tutorial that will teach you how to build a fully functional contacts manager application in JavaScript using CanJS and jQuery. When you're done with this tutorial, you'll have all you need to build your own JavaScript applications using CanJS.

## Choosing the Right Tool


Building a JavaScript application without the right tools is difficult. While jQuery is great at what it does, a DOM manipulation library doesn't provide any infrastructure for building apps. This is why you need to use a library like CanJS.

CanJS is a lightweight MVC library that gives you the tools you need to build JavaScript apps. It provides all the structure of the MVC (Model-View-Control) pattern, templates with live binding, routing support and is [memory safe](http://bitovi.com/blog/2012/04/zombie-apocolypse.html). It supports jQuery, Zepto, Mootools, YUI and Dojo and has a rich set of extensions and plugins.

In part one you will:

- Create a Control and a View (client-side template) to display a list of contacts
- Represent data in an application using Models
- Simulate ajax responses using the fixtures plugin

Excited? You should be. Now let's get coding.

## Setting Up Your Folders and HTML

You'll need to create a folder for your application. Inside this folder you need four subfolders: css, js, views and img. Your folder structure should look like this when you're done:

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

At the bottom of the page we load jQuery, CanJS, the fixture plugin and our application code (`contacts.js`).

## Building Your UI With Views

Views are client-side templates that are used to render parts of your app. CanJS supports multiple templating languages, but this tutorial will be using EJS (Embedded JavaScript), which is packaged with CanJS and supports live binding.

EJS templates look like HTML but with magic tags where you want dynamic behavior (using JavaScript). There are three types of magic tags in EJS:

- `<% CODE %>`: Runs JavaScript code
- `<%= CODE %>`: Runs a JavaScript statement and writes the **escaped** result into the resulting HTML
- `<%== CODE %>`: Runs a JavaScript statement and writes the **unescaped** result into the resulting HTML (used for sub-templates)

Templates can be loaded from a file or a script tag. In this tutorial templates will be loaded from EJS files. Save the following code as `contactsList.ejs` in your views folder:

```html
<ul class="unstyled clearfix">
	<% list(contacts, function(contact){ %>
		<li class="contact span8" <%= (el)-> el.data('contact', contact) %>>
			<%== can.view.render('contactView', {contact: contact, categories: categories}) %>
		</li>
	<% }) %>
</ul>
```

The `contactList` view will render the list of contacts. Let's examine the template code here in more detail by looking at a few important lines:

- **Line 1**: Invoke a callback function on each contact in the list using the EJS `list()` helper. When used with an observable list, the `list()` helper will use live binding to re-run anytime the length of the list changes.
- **Line 3**: Add the contact instance to the `<li`> using an element callback. Everything after the arrow is a function that will be executed with `el` set to the current element.
- **Line 4**: Use `can.view.render()` to render the `contactView.ejs` sub-template for each contact. `can.view.render()` takes a template and data and returns HTML.

Save this code as `contactView.ejs` in your views folder:

```html
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
```

`contactView.ejs` renders a single contact. Each piece of data is placed in an input tag. While that does nothing for us now, later in this tutorial these will be used to add and update a contact's information.

## Making Your Views Live

Throughout these views, it seems like we are using `.attr()` to read properties in some places but not others. What's the difference? Using `attr()` tells EJS that we want that piece of code to update automatically when the underlying data changes. This is called live binding. In EJS, live binding is opt-in, meaning we have to tell EJS what data should be updated when the underlying data changes. If we use regular dot notation to access properties, they will not be live. Let's look at the name input from the `contactView.ejs` to see how this works:

```html
<input type="text" name="name" placeholder="Add Name" 
	<%= !contact.attr('name') ? "class='empty'" : "value='" + contact.name + "'" %>>
```

==
Behind the scenes, EJS will turn this into an event handler listening to the contact's name property. When the name property changes elsewhere in the application `contact.attr('name', 'Doug')`, that event handler is triggered and the view will be updated.
==

/*When EJS encounters this template code, it will wrap the entire contents of the magic tags (`<%= %>`) in a function that will be called when the contact's name property is changed. 
That's why we don't need to use .attr('name') a second time here and can use `contact.name` instead.*/

## Organizing Application Logic Using can.Control

`can.Control` creates an organized, memory-leak free, stateful control that can be used to create widgets or organize application logic. You create an instance of a Control on a DOM element and pass in any data your Control will need. You can define any number of functions in your Control and bind to events. When the element your Control is bound to is removed from the DOM, the Control destroys itself, cleaning up any bound event listeners.

To create a new Control use the `can.Control()` function. you pass it an object that contains functions, you can also pass in event listeners...we'll do that in part 2 and pass it an object containing functions and event bindings. 

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
- `init()`: called when an instance is created
- `destory()`: called when this instance is destroyed

==when an instance is created, the list of contacts is rendered==
==This method does two things:
- render view
- use jQuery html function
==

The only thing to do when a `Contacts` instance is created, is render the list of contacts we pass into it. The `can.view()` function takes 2 parameters: the file, text or id of the script tag containing our template code and and data the view will use to render the HTML. Here we use the id `contactsList` and pass the list of contacts and the list of categories. Then we use jQuery's `.html()` function, which takes the document fragment returned by `can.view()` and populates the DOM element with the list of contacts.

## Representing Data Using Models

A Model abstracts the data layer of an application. We'll need two models: one for contacts and one for categories. Add this code to `contacts.js`:

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

Our models here are missing a few of the static methods I mentioned because we won't need those operations in this application and can safely omit them.

It's important to point out here, that the model instances in CanJS are actually what we call 'observables'. `can.Observe` provides the observable pattern for objects and `can.Observe.List` provides the observable pattern for arrays. This means you can get and set properties using `attr()` and bind to changes in those properties. 

==The findAll method returns a model.list, which is really a can.Observe.List== that triggers events when an element is added, removed or updated.
When we use a Model's `findAll()` method, we are getting a `Model.List` which is a `can.Observe.List` that triggers events when an element is added, removed or updated.

## Simulating a REST Service Using Fixtures

Still with me? Great, because we are about to see how we can simulate ajax responses to build our JavaScript application without needing a backend.

==move this inot the first sentence: This is great for testing, prototyping or when the back-end isn't ready yet==

Fixtures intercept ajax requests and simulate their response with a file or function. We'll use fixtures to simulate a REST service that our Models are setup to use.

But first, you'll need some sample data for our application. Add this code to `contacts.js`:

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

Now that we have data, we have to wire them up to the services using fixtures. Using `can.fixture()`, which takes two parameters. The first is the URL we want to intercept and the second is a file or function that is used to generate a response. ==Often URLs you want to intercept are not dynamic but follow a pattern. In this case we use templates URLs==We often want fixtures to intercept multiple URLs with one fixture so we use templated URLs. Just add curly braces to the URL where you want to match wildcards.

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

The first four fixtures simulate the `GET`, `POST`, `PUT` and `DELETE` ajax responses for the `Contact` model and the fifth fixture simulates the `GET` response for the `Category` model.

## Bootstrapping The Application

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
==line number for breakdown==

When the DOM is ready, we call `findAll()` on both of our models to retrieve all of the contacts and categories. Since `findAll()` returns a Deferred, we can use jQuery's `$.when()` to execute both requests in parlell. When both of these requests are complete, our callback function will be executed with the response of these two requests. These parameters are arrays, with the first index being the `Model.List` of model instances retrieved. In the callback, a new instance of the `Contact` Control is created on the `#contacts` element and is passed the list of contacts and categories.

## Summary

That's it for part one of this tutorial. You've been introduced to the core of CanJS: Models, Views and Controls. ==Models abstract the data layer==represent data in our applications, Views are templates that turn our data into HTML and Controls wire everything up.

In part 2, you'll create a Control and View to display categories and use routing to filter contacts. Hope to see you there.