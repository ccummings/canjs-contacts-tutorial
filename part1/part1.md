This is part one of a three part tutorial that will teach you how to build a contacts manager application in JavaScript using CanJS and jQuery. When you're done with this tutorial, you'll have all you need to build your own JavaScript applications using CanJS.

## Choosing the Right Tool


Building a JavaScript application without the right tools is difficult. While jQuery is great at what it does, a DOM manipulation library doesn't provide any infrastructure for building applications. This is why you need to use a library like CanJS.

CanJS is a lightweight MVC library that gives you the tools you need to build JavaScript apps. It provides all the structure of the MVC (Model-View-Control) pattern, templates with live binding, routing support and is [memory safe](http://bitovi.com/blog/2012/04/zombie-apocolypse.html). It supports jQuery, Zepto, Mootools, YUI, Dojo and has a rich set of extensions and plugins.

In part one you will:

- Create a Control and View (client-side template) to display contacts
- Represent data using Models
- Simulate ajax responses using the fixtures plugin

Excited? You should be. Now let's get coding.

## Setting Up Your Folders and HTML

You'll need to create a folder for your application. Inside this folder you need four sub folders: css, js, views and img. Your folder structure should look like this when you're done:

- contacts_manager
	- css
	- js
	- views
	- img

Save this as `index.html`:

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

At the bottom of the page we load jQuery, CanJS, the fixture plugin and your application code (`contacts.js`).

The CSS and images for this tutorial can be downloaded using the link above.

## Building Your UI With Views

Views are client-side templates that are used to render parts of your app. CanJS supports multiple templating languages, but this tutorial will be using EJS (Embedded JavaScript), which is packaged with CanJS and supports live binding.

EJS templates look like HTML but with magic tags where you want dynamic behavior (using JavaScript). There are three types of magic tags in EJS:

- `<% CODE %>`: Runs JavaScript code
- `<%= CODE %>`: Runs a JavaScript statement and writes the **escaped** result into the resulting HTML
- `<%== CODE %>`: Runs a JavaScript statement and writes the **unescaped** result into the resulting HTML (used for sub-templates)

Templates can be loaded from a file or script tag. In this tutorial templates will be loaded from EJS files. Save the following code as `contactsList.ejs` in your views folder:

```html
<ul class="unstyled clearfix">
	<% list(contacts, function(contact){ %>
		<li class="contact span8" <%= (el)-> el.data('contact', contact) %>>
			<%== can.view.render('views/contactView.ejs', {contact: contact, categories: categories}) %>
		</li>
	<% }) %>
</ul>
```

`contactLists.ejs` will render a list of contacts. Let's examine the template code here in more detail:

- **Line 2**: The EJS `list()` helper invokes a callback function on each contact in the list. When used with an observable list, the `list()` helper will use live binding to re-run anytime the length of the list changes.
- **Line 3**: Uses an element callback to add the contact instance to the data of the `<li>`. Everything after the arrow is wrapped in a function that will be executed with `el` set to the current element.
- **Line 4**: Renders the `contactView.ejs` sub-template for each contact. `can.view.render()` takes a template and data as its parameters and returns HTML.

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

`contactView.ejs` renders a single contact. Each property of a contact is placed in an input tag. These will be used to add and update a contact's information.

## Making Your Views Live

Anytime EJS encounters `attr()` while processing a template it knows that the surrounding code should be turned into an event handler bound to that property's changes. When the property is changed elsewhere in the app, the event handler is triggered and your UI will be updated. This is called live binding.

EJS Live binding is opt-in. It only turns on if you use `attr()`.

Let's look at the name `<input>` from the `contactView.ejs` to see how this works:

```html
<input type="text" name="name" placeholder="Add Name" 
	<%= !contact.attr('name') ? "class='empty'" : "value='" + contact.name + "'" %>>
```

The code in the magic tags will become an event handler bound to the contact's name property. When we update the name property, the event handler is run and the HTML will be updated.

## Organizing Application Logic Using can.Control

`can.Control` creates an organized, memory-leak free, stateful control that can be used to create widgets or organize application logic. You create an instance of a Control on a DOM element and pass it any data your Control will need. You can define any number of functions in your Control and bind to events. When the element your Control is bound to is removed from the DOM, the Control destroys itself, cleaning up any bound event listeners.

To create a new Control extend `can.Control()` by passing it an object containing functions you want to define. In part two, event listeners will be passed in as well.

There are a few important variables and functions present in every Control instance:

- `this` a reference to the Control instance
- `this.element` the DOM element that you created the instance on
- `this.options` an object containing any data passed to the instance when it was created
- `init()` called when an instance is created

Add this to your `contacts.js` file to create the Control that will manage contacts:

```js
Contacts = can.Control({
	init: function(){
		this.element.html(can.view('views/contactsList.ejs', {
			contacts: this.options.contacts,
			categories: this.options.categories
		}));
	}
})
```

When an instance of `Contacts` is created, `init()` will do two things:

1. Uses `can.view()` to render contacts. `can.view()` takes 2 parameters: the file or id of the script tag containing our template code and data. It returns the rendered result as a documentFragment (a lightweight container that can hold DOM elements).
2. Inserts the documentFragment from `can.view()` into the Control's element using jQuery's `.html()`.

## Representing Data Using Models

A Model abstracts the data layer of an application. Two models are needed in this application: one for contacts and one for categories. Add this code to `contacts.js`:

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

A model has 5 static methods you can define to create, retrieve, update and delete data. They are `findAll`, `findOne`, `create`, `update` and `destroy`. You can overwrite these functions to work with any back-end, but the easiest way to define a Model is using REST service like the code above. You can safely omit any static methods that won't be used in an application.

It's important to point out here, that the model instances in CanJS are actually what we call 'observables'. `can.Observe` provides the observable pattern for objects and `can.Observe.List` provides the observable pattern for arrays. This means you can get and set properties using `attr()` and bind to changes in those properties. 

The `findAll()` method returns a `Model.list`, which is a `can.Observe.List` that triggers events when an element is added or removed from the list.

## Simulating a REST Service Using Fixtures

Fixtures intercept ajax requests and simulate their response with a file or function. This is great for testing, prototyping or when a back-end isn't ready yet. Fixtures are needed to simulate the REST service the models in this application are using.

But first, you'll need some sample data for the fixtures to use. Add this code to `contacts.js`:

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

Now that you have some data, you need to wire it up to fixtures so you can simulate a REST service. `can.fixture()` takes two parameters. The first is the URL we want to intercept and the second is a file or function that is used to generate a response. Often URLs you want to intercept are dynamic and follow a pattern. In this case you should use templated URLs. Just add curly braces to the URL where you want to match wildcards.

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

The first four fixtures simulate the `GET`, `POST`, `PUT` and `DELETE` responses for the `Contact` model and the fifth fixture simulates the `GET` response for the `Category` model.

## Bootstrapping The Application

Your application has Models for your data, Views to render contacts and a Control to hook everything up, Now you need to kickstart the application.

Add this to your `contacts.js` file:

```js
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
```

Let's take a closer look at what is happening in this code:

- **Line 1**: Wait for the DOM to be ready using jQuery's document ready function.
- **Line 2**: Call `findAll()` on both models to retrieve all of the contacts and categories. Since `findAll()` returns a Deferred, `$.when()` is used to make both requests in parallel and execute a callback when they are finished.
- **Line 3-4**: Get the list of model instances from the response of the two `findAll()` calls. The responses are arrays, with the first index being the list of model instances retrieved.
- **Line 6-9**: Create an instance of the `Contact` Control on the `#contacts` element. The list of contacts and categories are passed into the Control.

## Summary

That's it for part one of this tutorial. You've been introduced to the core of CanJS: 

- `Models` abstract the data layer in your application
- `Views` are templates that turn data into HTML
- `Controls` wire everything up.

In part two, you'll create a Control and View to display categories and use routing to filter contacts. Hope to see you there.