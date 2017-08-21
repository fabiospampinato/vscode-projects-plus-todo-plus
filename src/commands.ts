
/* IMPORT */

import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';
import Config from './config';
import Utils from './utils';
import ProjectsConfig from '../node_modules/vscode-projects-plus/src/config';
import ProjectsUtils from '../node_modules/vscode-projects-plus/src/utils';
import TodoConsts from '../node_modules/vscode-todo-plus/src/consts';
import TodoUtils from '../node_modules/vscode-todo-plus/src/utils';

/* COMMANDS */

async function todo () {

  const config = Config.get (),
        projectsConfig = await ProjectsConfig.get ();

  let lastGroup,
      content = '';

  ProjectsUtils.config.walkProjects ( projectsConfig, ( project, parent, depth ) => {

    const group = parent.name,
          todo = TodoUtils.todo.get ( project.path );

    if ( !config.hideEmpty || ( todo && todo.content ) ) {

      if ( group && group != lastGroup ) {

        content += Utils.string.indent ( group, depth - 1 ) + TodoConsts.symbols.project + '\n'; // Group

        lastGroup = group;

      }

      content += Utils.string.indent ( project.name, depth ) + TodoConsts.symbols.project + '\n'; // Project

      if ( todo ) {

        content += Utils.string.indent ( todo.content, depth + 1 ) + '\n'; // Todo

      }

    }

  });

  if ( !content ) return vscode.window.showErrorMessage ( 'You don\'t have any todo across your projects' );

  content = Utils.string.stripRegex ( content, /^\s*[\r\n]/gm, true );

  if ( config.hideDone ) {

    content = Utils.string.stripRegex ( content, TodoConsts.regexes.todoDone );

  }

  if ( config.hideCancelled ) {

    content = Utils.string.stripRegex ( content, TodoConsts.regexes.todoCancel );

  }

  if ( config.hideComments ) {

    content = Utils.string.stripRegex ( content, TodoConsts.regexes.comment );

  }

  Utils.editor.open ( content );

}

/* EXPORT */

export {todo};
