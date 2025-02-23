# Smelter

An Electron application with React

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Documentation Standards

This project uses JSDoc for documentation. All code should be documented following these guidelines:

### Components

- Must have a component description
- Must document all props using TypeDefs
- Must specify return type
- Must document any significant state or effects

### Functions

- Must have a description
- Must document all parameters
- Must document return type
- Must document thrown errors if any

### Example

```javascript
/**
 * @typedef {Object} UserProps
 * @property {string} name - The user's name
 * @property {number} age - The user's age
 */

/**
 * Displays user information
 * @param {UserProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
function User({ name, age }) {
  return (
    <div>
      {name} ({age})
    </div>
  );
}
```

### Generating Documentation

Run `npm run docs` to generate documentation in the `docs` directory.

### Development Notes

[Dev Notes](./dev-notes/README.md)

and so on...
