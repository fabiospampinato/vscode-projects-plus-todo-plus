
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

/* HELPERS */

function parseTodo ( config, str ) {

  str = Utils.string.stripEmptyLines ( str );

  if ( config.hideDone ) {

    str = Utils.string.stripRegex ( str, TodoConsts.regexes.todoDone );

  }

  if ( config.hideCancelled ) {

    str = Utils.string.stripRegex ( str, TodoConsts.regexes.todoCancel );

  }

  if ( config.hideComments ) {

    str = Utils.string.stripRegex ( str, TodoConsts.regexes.comment );

  }

  return str;

}

function filterProjectsByConfig ( config, obj ) {

  ProjectsUtils.config.walkProjects ( obj, ( project, parent ) => {

    if ( config.filterRegex && !project.name.match ( new RegExp ( config.filterRegex ) ) ) {

      parent.projects = parent.projects.filter ( p => p !== project );

    }

  });

}

function fetchTodos ( config, obj ) {

  ProjectsUtils.config.walkProjects ( obj, project => {

    const todo = TodoUtils.todo.get ( project.path );

    if ( todo ) {

      const parsed = parseTodo ( config, todo.content );

      if ( parsed ) {

        const linesNr = parsed.split ( '\n' ).filter ( _.identity ).length,
              projectsNr = TodoUtils.getAllMatches ( parsed, TodoConsts.regexes.project, true ).length;

        if ( linesNr === projectsNr ) return; // Only projects -> not interesting

        project.todo = parsed;

      }

    }

  });

}

function filterProjectsByTodo ( config, obj ) {

  if ( !config.hideEmpty ) return;

  ProjectsUtils.config.walkProjects ( obj, ( project, parent ) => {

    if ( !project.todo ) {

      parent.projects = parent.projects.filter ( p => p !== project );

    }

  });

}

function filterGroups ( config, obj, maxDepth = Infinity ) {

  if ( !config.hideEmpty ) return;

  let maxFilteredDepth = -1;

  ProjectsUtils.config.walkGroups ( obj, ( group, parent, depth ) => {

    if ( depth > maxDepth ) return;

    if ( ( !group.projects || !group.projects.length ) && ( !group.groups || !group.groups.length ) ) {

      parent.groups = parent.groups.filter ( g => g !== group );

      maxFilteredDepth = Math.max ( maxFilteredDepth, depth );

    }

  });

  if ( maxFilteredDepth > 0 ) {

    filterGroups ( config, obj, maxFilteredDepth - 1 );

  }

}

function mergeTodos ( config, obj ) {

  const lines = [];

  ProjectsUtils.config.walk ( obj, ( item, parent, depth ) => {

    lines.push ( Utils.string.indent ( item.name, depth ) + TodoConsts.symbols.project );

    if ( item.todo ) {

      lines.push ( Utils.string.indent ( item.todo, depth + 1 ) );

    }

  }, _.noop, _.noop );

  return lines.join ( '\n' );

}

/* COMMANDS */

async function todo () {

  const config = Config.get (),
        obj = _.cloneDeep ( await ProjectsConfig.get () );

  filterProjectsByConfig ( config, obj );

  fetchTodos ( config, obj );

  filterProjectsByTodo ( config, obj );

  filterGroups ( config, obj );

  const content = Utils.string.stripEmptyLines ( mergeTodos ( config, obj ) );

  if ( content ) {

    Utils.editor.open ( content );

  } else {

    vscode.window.showInformationMessage ( 'You don\'t have any todo across your projects' );

  }

}

/* EXPORT */

export {todo};
