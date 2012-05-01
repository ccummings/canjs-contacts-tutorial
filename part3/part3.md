In this tutorial, we're going to continue building a contacts manager using CanJS and jQuery. In part two, we added routing and filtering to our application.

In this part of the tutorial, we're going to learn how to add and edit contacts and save those changes in a model. We'll be adding to the the source files from part 1 and 2 so if you haven't done so already, go read those to catch up.

## Updating a Contact

If you remember in part 1, the `ContactView` displayed all of a contact's information using `<input>` tags. If you tried editing these inputs, nothing would happen. We'll fix that by binding to the focus and keyup events of these inputs using the `Contacts` control. Add this code to the `Contacts` control in `contacts.js`:

```js
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
},
updateContact: function(el){
	var contact = el.closest('.contact').data('contact');
	contact.attr(el.attr('name'), el.val()).save();
}
```

The first function binds to the `focusout` event on any of the inputs in our list of contacts. When this happens, we call `updateContact()` and pass it the element that triggered the event.

The second function binds to the `keyup` event on any of the inputs. What we want to do is trigger a `blur` event on the input if the enter key was pressed. This will fire a `focusout` event, which will be captured by the `focusout` handler.

The third function binds to the `change` event of any of the drop downs in our list of contacts. When one of these changes, we call `updateContact()` and pass it the drop down element.

The last function is called by each of the event handlers above and actually updates a contact with the new information. The first thing we have to do is retrieve the contact instance from the DOM. 

You may remember that we added the instance to each `<li>` using `$.data()` in `contactView` way back in part 1. Once we have the contact instance, we use `attr()` to update the contact with the value that changed. Each of the inputs has a name attribute that matches a property name, so we can use `el.attr('name')` to get the name of the property we are updating. To save these changes to the model, we call `save()`.

When we call `save()`, the model will check if we are creating a brand new instance or updating an existing instance. It knows this because an `id` property will be present on any existing instance. The model will trigger a `created` or `updated` event depending on the operation the model performed.

## Deleting a Contact

There is a small link with an 'X' in the top right corner of each contact. When this is clicked, we want to delete that contact. To do this, add another event listener to the `Contacts` control that looks like this:

```js
'.remove click': function(el, ev){
	el.closest('.contact').data('contact').destroy();
}
```

When anything with a class of `remove` is clicked, we retrieve the instance of the contact and call `destroy()` on it. This will delete the contact and remove it from any `Model.List` that contain the contact. Because we are using live binding in our views, this change will be reflected right away.

## Creating a Contact

We need to add a giant "New Contact" button to `index.html`. Add this code right above `<div id="filter">`:

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

This view re-uses the `contactView` template to render the form for adding a contact and adds save and cancel buttons.

Now we need to create a new Control named `Create` that will be responsible for displaying the form and creating contacts. Add the following code to `contacts.js`:

```js
Create = can.Control({
	show: function(){
		this.contact = new Contact();
		this.element.html(can.view('createView', {
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
```

There's a lot of stuff going on here, but most of it you have seen in previous parts of this tutorial. Let's go over each function in this Control:

- `show`: creates a new empty contact using `new Contact({})` and caches this in the control as `this.contact`. This new contact is passed to the view to be rendered.
- `hide`: slides the form up
- `{document} #new-contact click`: Binding to an event originating from an element outside of the Control. In this case we listen for our shiny "New Contact" button to be clicked. When it is, we show the form by calling `show()`
- `.cancel click`: hides the form by calling `hide()` when the cancel button is clicked
- `.contact input keyup`: If the enter key is pressed while the focus is on one of the form's inputs, we call `createContact()`
- `.save click`: call `saveContact()` when the "Save" button is clicked

'createContact()' does all of the heavy lifting here. First we find the `<form>` element that contains all the new contact information and use jQuery's `serialize()` function to get a string representing all the form values. Then we use `can.deparam` which converts the serialized string into an object. This object is passed into the `attr()` function which will update each property in the object with its corresponding value. Finally we call `save()` and hide the form. 

## Reacting to a New Contact

We need to add an event listener to our `Contacts` Control so the new contact is added to the list of contacts we are displaying. Add this function to the `Contacts` Control in `contacts.js`:

```js
'{Contact} created' : function(list, ev, contact){
	this.options.contacts.push(contact);
}
```

This binds to the `created` event of the `Contact` model. We add the new contact to the list that was passed into the Control which will cause the view to re-render displaying our new contact.

All this does is re-renders the list of categories by calling `render()` when a contact is created.

## Summary

In this tutorial we learned how to add and edit contacts in our application.

We created new Views and Contorls, saw how easy it is to create and edit model instances and how to bind to Model events. We also saw, again, how live binding makes it easy to keep your UI in sync with your application's data

This is the end of the CanJS contacts manager tutorial. We have now covered the basics of what it takes to build an application in CanJS. For more in-depth documentation and more examples, visit [CanJS](http://canjs.us). Thanks for reading!