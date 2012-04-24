# Contacts Tutorial

## Structure of App

### 2 Models + Fixtures

- Contact
- Category

### 3 Controls

- Filter: Left nav filtering
- Contacts: List of contacts
- Create: Creates new contact

### Routes

- Pretty URLs #!filter/:category

### 4 Views

- ContactsList: List of contacts (renders multiple ContactView views)
- CreateView: Renders a ContactView, this adds save/cancel buttons
- ContactView: What a contact looks like (used for create and list)
- Filter View: List of categories

## Features

### Create a contact

- click the new contact button
	- form slides down

### Edit a contact

- Each piece of data is already an input that activates on hover/focus
	- just change the data and focus out or press enter to update the contact

### Filter

- Use navigation to filter what contacts are visible
- number beside each filter will update when contacts are created & updated

## Tutorial Breakdown

### Part 1: Setup

- Libraries Used
- Basic HTML
- Models
	- Intro
	- Contact
	- Category
- Fixtures
	- Intro
	- Contact
	- Category
- Views
	- EJS Intro
	- ContactsList
	- ContactView
- Controls
	- Contacts

### Part 2: Filtering & Routes

- FilterView
- Filter Control
- Model.List
	- Intro
	- Contact.List
- Routing
	- Pretty URLs
	- Responding to route changes
		- Contact
		- Filter

### Part 3: Editing Contacts

- Additions to Contact
- Updating a contact 
- Updating contact in model
- Deleting a contact instance
- Removing contact from model

### Part 4: Add Contacts

- CreateView
- Create Control
- Adding contact to Model
- Rendering a new contact
	- Contact
