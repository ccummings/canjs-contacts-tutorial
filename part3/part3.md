In this tutorial, we're going to continue building a contacts manager using CanJS and jQuery. In part two, we added routing and filtering to our application.

In this part of the tutorial, we're going to learn how to make changes to the contacts and save those changes in a model. We'll be adding to the the source files from part 1 and 2 so if you haven't done so already, go read those to catch up.

## Updating a Contact

If you remember in part 1, the `ContactView` displayed all of a contact's information using `<input>` tags. If you tried editing these inputs, nothing would happen. We'll fix that by using the binding to the focus and keyup events of these inputs using the `Contacts` control. Add this code to the `Contacts` control in `contacts.js`:

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
	this.render()
},
updateContact: function(el){
	var contact = el.closest('.contact').data('contact');

	contact.attr(el.attr('name'), el.val()).save();
}
```

The first function binds to the `focusout` event on any of the inputs in our list of contacts. When this happens, we call `updateContact` and pass it the element that triggered the event.

The second function binds to the `keyup` event on any of the inputs. What we want to do is trigger a `blur` event on the input if enter was pressed. This will fire a `focusout` event, which will be captured by the `focusour` handler.

The third function binds to the `change` event on any of the selects in our list of contacts. When one of these changes, the user is changing the category a contact is in, so we call `updateContact` then `render` to re-render the current list of contacts.

The last function is called by each of the event handlers above and actually updates a contact with the new information. The first thing we have to do is retrieve the contact instance from the DOM. You may remember that we added the instance to each `<li>` using `$.data` in `contactView` way back in part 1. Once we have the contact instance, we use `attr()` to update the property of the contact with the value of the changed input. Each of the inputs has a name attribute that matches a property name, so we can use `el.attr('name')` to get the name of the property we are updating. To save this update to the model, we call `save()`.

When we call `save()`, the model will check if we are saving a brand new instance or updating an existing instance. It knows this because an `id` property will be present on any existing instance. The model will trigger a `created` or `updated` event depending on the operation the model performed.

## Revisiting Live Binding

Now that we can update and save the properties of a contact, we should look at how the live binding we added in part 1 of this tutorial is working. Remember this from the `contactView`?

```html
<input type="text" name="address" <%= !contact.attr('address') ? "class=\"empty\"" : "value=\"" + contact.address + "\"" %>>
```

If you empty any of the `input` tags, you'll see that the border that usually only appears on hover, remains after you mouse out. That's because, the `empty` class is being applied to the input. If you enter a value into the empty input, the empty class will be removed. This is all happening without re-rendering the view because everything in the magic tags is re-reun when the contact is updated. That's the power of live-binding and it is awesome.

## Updating the Filter

So we can change all the information stored for a contact including its category, but now the numbers beside each category are off. We need the `Filter` control to re-render when any contact is updated. To do this, add the following to the `Filter` control in `contacts.js`:

```js
'{Contact} updated' : function(list, ev, item){
	this.render();
}
```

Here we use templated event bindings to listen to an object that is outside of the control. When a control encounters this, it will first look in the data passed to it and then to the global scope. In this case `{Contact}` refers to the model representing contacts in our application. So this function will be called any time a contact is updated. All we want to do when that happens is call `render`, so the category counts get updated.

## Deleting a Contact

There is a small link with an 'X' in the top right corner of each contact. When this is clicked, we want to delete that contact. To do this, add another event listener to the `Contacts` control that looks like this:

```js
'.remove click': function(el, ev){
	el.closest('.contact').data('contact').destroy();
}
```

When anything with a class of `remove` is clicked, we retrieve the instance of the contact and call `destroy` on it. This will delete the contact and remove it from and `Model.List` that contain the contact. This means that when a contact is deleted, our list of contacts is updated automatically because the `list` helper was used in our `contactsList` view.

## Summary

In this tutorial we added the ability to edit and remove contacts and save those changes to our model.

We saw how to retrieve model instances from the DOM and how to modify and save changes on an instance. We also saw how we can bind to the `update` event of a model to keep our UI in synch with our data model.

In the next part of the tutorial, we'll see how to add a new contact to our application.