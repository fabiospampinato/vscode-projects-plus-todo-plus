
/* IMPORT */

import * as _ from 'lodash';
import * as vscode from 'vscode';
import * as Commands from './commands';
import Config from './config';
import TodoConsts from '../node_modules/vscode-todo-plus/src/consts';

/* UTILS */

const Utils = {

  initCommands ( context: vscode.ExtensionContext ) {

    const {commands} = vscode.extensions.getExtension ( 'fabiospampinato.vscode-projects-plus-todo-plus' ).packageJSON.contributes;

    commands.forEach ( ({ command, title }) => {

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand ( command, () => handler () );

      context.subscriptions.push ( disposable );

    });

    return Commands;

  },

  editor: {

    open ( content ) {

      vscode.workspace.openTextDocument ({ language: TodoConsts.languageId }).then ( ( textDocument: vscode.TextDocument ) => {

        vscode.window.showTextDocument ( textDocument ).then ( ( textEditor: vscode.TextEditor ) => {

          textEditor.edit ( edit => {

            const pos = new vscode.Position ( 0, 0 );

            edit.insert ( pos, content );

            textEditor.document.save ();

          });

        });

      });

    }

  },

  string: {

    stripRegex ( str, regex, global: boolean = false ) {

      if ( global ) {

        return str.replace ( regex, '' );

      } else {

        return str.split ( '\n' )
                  .filter ( line => !line.match ( regex ) )
                  .join ( '\n' );

      }

    },

    indent ( str, depth = 1, indentation = Config.get ().indentation ) {

      const level = _.repeat ( indentation, depth );

      return str.split ( '\n' )
                .map ( line => `${level}${line}` )
                .join ( '\n' );

    }

  }

};

/* EXPORT */

export default Utils;
