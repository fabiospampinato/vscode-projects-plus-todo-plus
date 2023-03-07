# Projects+ Todo+

<p align="center">
  <img src="https://raw.githubusercontent.com/fabiospampinato/vscode-projects-plus-todo-plus/master/resources/logo.png" width="128" alt="Logo">
</p>

Bird's-eye view over your projects, view all your todo files aggregated into one.

## Install

Follow the instructions in the [Marketplace](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-projects-plus-todo-plus), or run the following in the command palette:

```shell
ext install fabiospampinato.vscode-projects-plus
ext install fabiospampinato.vscode-todo-plus
ext install fabiospampinato.vscode-projects-plus-todo-plus
```

## Usage

It adds 2 commands to the command palette:

```js
Projects: Todo // Open a file containing all your todo files aggregated into one
Projects: Embedded Todos // Open a file containing all your embedded todos aggregated into one
```penso che vengo, se trovo come o se non è troppo presto, penso in caso messo jeans e

## Settings

```js
{
  "projectsTodo.indentation": "  ", // String used for indentation
  "projectsTodo.showPaths": true, // Show individual todo files paths
  "projectsTodo.hideEmpty": true, // Hide projects and groups without any todo
  "projectsTodo.hideDone": true, // Hide any done todo
  "projectsTodo.hideCancelled": true, // Hide any cancelled todo
  "projectsTodo.hideComments": false, // Hide all the comments
  "projectsTodo.hideArchives": true, // Hide any archive section
  "projectsTodo.filterRegex": false // List only projects having a name matching this regex
}
```

## Demo

![Demo](resources/demo.png)

## Contributing

If you found a problem, or have a feature request, please open an [issue](https://github.com/fabiospampinato/vscode-projects-plus-todo-plus/issues) about it.

If you want to make a pull request you can debug the extension using [Debug Launcher](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-debug-launcher).

## License

MIT © Fabio Spampinato
