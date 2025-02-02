# Form Element to Object Transformer Documentation

## Overview
This utility transforms DOM form elements into a structured JavaScript object, handling nested objects and arrays while maintaining immutability throughout the process. It's designed using functional programming principles, with pure functions organized into focused operation groups.

## Core Components

### PathOps
A collection of pure functions for handling path operations in nested objects:

- `push(path, name)`: Adds a new segment to a path array
- `pop(path)`: Removes the last segment from a path array
- `getIn(obj, path)`: Safely traverses nested objects, creating missing objects
- `setIn(obj, path, value)`: Immutably sets values at nested paths

### ValueOps
Handles extraction of values from DOM elements:

- `getName(element)`: Extracts names from input/text elements
- `getValue(element)`: Converts form values to appropriate types (numbers, booleans, dates)
- `getKeyValue(element)`: Combines key and value extraction into a single operation

### FormStateOps
Manages form state transitions:

- `createState()`: Initializes state with a 'main' root
- `handleStructural(state, element)`: Processes object/array elements
- `handleValue(state, element)`: Handles simple values and lists
- `handleArrayConversion(state)`: Converts objects to arrays when needed
- `handleObjectEnd(state)`: Handles completion of object processing

## Processing Flow

1. **Element Classification**
   The `processElement` function classifies each form element using CSS classes:
   - `is-object`: Denotes nested object structures
   - `is-array`: Indicates array structures
   - `is-last`: Marks end of current structure
   - `array-last`: Signals array conversion needed

2. **State Management**
   - State consists of:
     - `path`: Array tracking current position in object structure
     - `result`: Accumulated result object
   - Each operation returns new state instead of modifying existing

3. **Main Transformation**
   `transformFormElementsToObject` orchestrates the process:
   - Converts NodeList to Array
   - Reduces over elements, threading state through
   - Returns final object without 'main' wrapper

## Expected Form Structure
The utility expects form elements with specific classes:
- `.object-name input` or `.label-text`: For names/keys
- `.element-value`: For values
- `.element-label`: For custom labels
- `.is-list`: For list-type elements

## Example Transformation
```javascript
// Input form structure:
<div class="is-object">
  <span class="object-name">user</span>
  <div class="element-label">name</div>
  <input class="element-value" value="John" />
</div>

// Resulting object:
{
  user: {
    name: "John"
  }
}
```

## Key Features
1. **Immutability**: All operations create new objects/arrays
2. **Type Handling**: Automatic conversion of values to appropriate types
3. **Flexible Structure**: Supports deeply nested objects and arrays
4. **Error Prevention**: Safe navigation and default values
5. **Modularity**: Clear separation of concerns between operations

## Integration with Other Components
The utility works with a separate `processList` function (imported from './process-list.js') for handling list-specific transformations.

## Real scenario example
```
<div class="is-object">
  <div class="object-name"><input value="settings" /></div>
  
  <div class="is-object">
    <div class="object-name"><input value="seo" /></div>
    
    <div>
      <input class="element-label" value="title" />
      <input class="element-value" value="My Homepage" />
    </div>
    
    <div>
      <input class="element-label" value="description" />
      <input class="element-value" value="Welcome to my site" />
    </div>
    
    <div class="is-last"></div>
  </div>
  
  <div class="is-last"></div>
</div>
```
Let's trace how PathOps is used as we process each element:

### First element (outer object):

```javascript
// processElement gets 'settings' from ValueOps.getName()
// Then calls FormStateOps.handleStructural:
state = {
  path: ['main'],
  result: { main: {} }
};

// PathOps.push adds 'settings' to path
newState = {
  path: ['main', 'settings'],
  result: { main: {} }
};
```
### Second element (seo object):

```javascript
// Similar process adds 'seo' to path
newState = {
  path: ['main', 'settings', 'seo'],
  result: { main: { settings: {} } }
};
```

### Title field:

```javascript
// FormStateOps.handleValue processes the title
const { key, value } = ValueOps.getKeyValue(element); // {key: 'title', value: 'My Homepage'}

// PathOps.getIn ensures the full path exists
const current = PathOps.getIn(state.result, state.path);
// current = state.result.main.settings.seo = {}

// PathOps.setIn creates new object with title added
newState = {
  path: ['main', 'settings', 'seo'],
  result: PathOps.setIn(
    state.result, 
    state.path,
    { ...current, title: 'My Homepage' }
  )
};
// result is now: { main: { settings: { seo: { title: 'My Homepage' } } } }
```
### Description field:

```javascript
// Similar process but adds to existing seo object
newState = {
  path: ['main', 'settings', 'seo'],
  result: PathOps.setIn(
    state.result,
    state.path,
    { 
      ...PathOps.getIn(state.result, state.path),
      description: 'Welcome to my site'
    }
  )
};
```
### SEO's is-last div:

```javascript
// FormStateOps.handleObjectEnd called
// PathOps.pop removes 'seo' from path
newState = {
  path: ['main', 'settings'],
  result: { main: { settings: { seo: {
    title: 'My Homepage',
    description: 'Welcome to my site'
  } } } }
};
```

### Settings' is-last div:

```javascript
// Another pop removes 'settings'
newState = {
  path: ['main'],
  result: { /* same as above */ }
};
```

The key patterns here are:

- push is used whenever we enter a new object/array structure
- getIn ensures we can safely access the current location
- setIn creates new object copies when adding values
- pop moves us back up the hierarchy when we finish a structure

PathOps maintains immutability throughout by:

- Using spread operators to create new arrays (push)
- Slicing arrays instead of modifying them (pop)
- Creating new objects during traversal (getIn)
- Building new object structures for updates (setIn)