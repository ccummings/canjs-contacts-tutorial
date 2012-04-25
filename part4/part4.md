In this tutorial, we're going to finish building a contacts manager using CanJS and jQuery. In part 3, we learned how to change and remove contacts and save these changes in our model.

In this part of the tutorial, we're going to learn how to add a new contact to our application and save the new contact in our model. We'll be adding to the source files from part 1, 2 and 3, so if you haven't done so already, go read part 1, 2 and 3 to catch up.

## Creating a Contact

First we need to add a giant "New Contact" button to `index.html`. Add this code right above `<div id="filter">`:

```html
<a class="btn btn-large btn-primary" href="javascript://" id="new-contact"><i class="icon-plus icon-white"></i> New Contact</a>
```

We also need to add a new view that will be used to render a form for creating a contact. Add the following to `index.html` after the other views:

```html
<script type="text/ejs" id="createView">
	<div class="hero-unit contact span8">
		<%== can.view.render('contactView', {contact: contact, categories: categories}) %>
		<div class="row">
			<div class="buttons pull-right">
				<a href="javascript://" class="btn btn-primary save">Save</a>
				<a href="javascript://" class="btn cancel">Cancel</a>
			</div>
		</div>
	</div>
</script>
```

Nothin too complicated here, since we just re-use the `contactView` view to render our form and add a save and cancel button.

Now we need to create a new Control named `Create` that will be responsible for displaying the form and adding new contacts. Add the following code to `contacts.js`:

```js
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
	'.cancel click' : function(){
		this.hide();
	},
	'.contact input keyup': function(el, ev) {
		if(ev.keyCode == 13){
			this.createContact(el);
		}
	},
	'.save click' : function(el){
		this.createContact(el)
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
});
```

There's a lot of stuff going on here, but most of it you have seen in previous parts of this tutorial. Let's go over each part of this Control.

- `render`: creates a new contact using `new Contact({})`. The new contact is stored in the control as `this.contact` and is passed to the view. Notice that the object we pass is empty, so a empty instance will be created.
- `show`: calls the `render` function and slides the form down
- `hide`: slides the form up
- `{document} #new-contact click`: Another example of binding to events originating outside of the Control. In this case we listen for our shiny "New Contact" button to be clicked. When it is, we show the form by calling `show`
- `.cancel click`: hides the form by calling `hide` when the cancel button is clicked
- `.contact input keyup`: If the enter key is pressed while the focus is on one of the form's inputs, we call `createContact`
- `.save click`: call `saveContact` when the "Save" button is clicked

'createContact' does all of the heavy lifting here. First we check that the name input is not blank, if it is, we don't do anything. If the name input has a value, we get all of the property values from the form, and use `attr()` to set the properties of the new contact. We have seen `attr()` before, but in this case we do a bulk update by passing an object of properties and values. Finally we call `save()` and hide the form. Because the new instance does not have an `id` property, the `created` event will be fired by the model.

## Reacting to a New Contact

We need to modify our other Controls so the new contact is included in the UI. First we'll add a function to the `Contacts` Control in `contacts.js`:

```js
'{Contact} created' : function(list, ev, contact){
	this.options.contacts.push(contact);
	this.render();
}
```

This binds to the `created` event of the `Contact` model. We add the new contact to the original list that was passed into the Control (`this.options.contacts`) and re-render the list of contacts by calling `render()`. We add the new contact to the original list because that is the list we use to create the filtered list in `render()`.

We also need to add a similar event binding to the `Filter` Control in `contacts.js`:

```js
'{Contact} created' : function(list, ev, item){
	this.render();
}
```

All this does is re-renders the list of categories by calling `render()` when a contact is created.

## Summary

In this tutorial we learned how to add contacts to our application.

We created a new View and Contorl, saw how easy it is to create a new model instance and how to bind to the `created` event of a model to keep your UI in synch.

This is the end of the CanJS contacts manager tutorial. We have now covered the basics of what it takes to build an application in CanJS. For more in-depth documentation and more examples, visit [CanJS](http://canjs.us). Thanks for reading!



