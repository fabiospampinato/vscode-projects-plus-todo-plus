
/* IMPORT */

import * as _ from 'lodash';
import * as micromatch from 'micromatch';
import * as path from 'path';
import * as querystring from 'querystring';
import stringMatches from 'string-matches';
import * as vscode from 'vscode';
import Config from './config';
import Utils from './utils';
import ProjectsConfig from 'vscode-projects-plus/out/src/config';
import ProjectsUtils from 'vscode-projects-plus/out/src/utils';
import TodoConsts from 'vscode-todo-plus/out/src/consts';
import TodoUtils from 'vscode-todo-plus/out/src/utils';

/* HELPERS */ //TODO: Move these to `Utils`

function parseTodo ( config, str ) {

  str = _.trimEnd ( str );
  str = Utils.string.stripEmptyLines ( str );

  if ( config.hideDone ) {

    str = Utils.string.stripRegex ( str, TodoConsts.regexes.todoDone );

  }

  if ( config.hideCancelled ) {

    str = Utils.string.stripRegex ( str, TodoConsts.regexes.todoCancelled );

  }

  if ( config.hideComments ) {

    str = Utils.string.stripRegex ( str, TodoConsts.regexes.comment );

  }

  if ( config.hideArchives ) {

    const match = _.last ( stringMatches ( str, TodoConsts.regexes.archive ) ) as any;

    if ( match ) {

      str = str.substring ( 0, match.index );

    }

  }

  return str;

}

function filterProjectsByConfig ( config, obj ) {

  if ( !config.filterRegex ) return;

  ProjectsUtils.config.walkProjects ( obj, ( project, parent ) => {

    if ( !project.name.match ( new RegExp ( config.filterRegex ) ) ) {

      parent.projects = parent.projects.filter ( p => p !== project );

    }

  });

}

async function filterProjectsByGlob ( obj ) {

  let includeGlob = await vscode.window.showInputBox ({
    placeHolder: 'Glob: foo*',
    value: '*'
  });

  if ( !includeGlob ) return;

  ProjectsUtils.config.walkProjects ( obj, ( project, parent ) => {

    if ( !micromatch.isMatch ( project.name, includeGlob ) ) {

      parent.projects = parent.projects.filter ( p => p !== project );

    }

  });

}

function fetchTodos ( config, obj ) {

  ProjectsUtils.config.walkProjects ( obj, project => {

    const todo = TodoUtils.todo.get ( ProjectsUtils.path.untildify ( project.path ) );

    if ( todo ) {

      todo.content = parseTodo ( config, todo.content );

      if ( todo.content ) {

        const linesNr = todo.content.split ( '\n' ).filter ( _.identity ).length,
              projectsNr = stringMatches ( todo.content, TodoConsts.regexes.project ).length;

        if ( config.hideEmpty && linesNr === projectsNr ) return; // Only projects is considered empty

        project.todo = todo;

      }

    }

  });

}

async function fetchTodosEmbedded ( config, obj ) {

  const projects = ProjectsUtils.config.getProjects ( obj );

  for ( let project of projects ) {

    const todos = await TodoUtils.embedded.get ( ProjectsUtils.path.untildify ( project.path ), false, true, false );

    delete TodoUtils.embedded.filePaths;

    project.todo = TodoUtils.embedded.renderTodos ( todos );
    project.todo = parseTodo ( config, project.todo );

  }

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

  const sepRe = new RegExp ( querystring.escape ( '/' ), 'g' ),
        lines = [];

  ProjectsUtils.config.walk ( obj, ( item, parent, depth ) => {

    let fileTag = '';

    if ( config.showPaths && item.todo && item.todo.path ) {

      const normalizedPath = path.normalize ( item.todo.path ),
            uriFilePath = vscode.Uri.file ( normalizedPath ).fsPath,
            filePath = `/${_.trimStart ( uriFilePath, '/' )}`,
            encodedFilePath = querystring.escape ( filePath ).replace ( sepRe, '/' );

      fileTag = ` @file://${encodedFilePath}`;

    }

    lines.push ( Utils.string.indent ( item.name, depth ) + TodoConsts.symbols.project + fileTag );

    if ( item.todo ) {

      lines.push ( Utils.string.indent ( item.todo.content || item.todo, depth + 1 ) );

    }

  }, _.noop, _.noop );

  return lines.join ( '\n' );

}

/* COMMANDS */

async function todo () {

  const config = Config.get (),
        obj = _.cloneDeep ( await ProjectsConfig.get () );

  filterProjectsByConfig ( config, obj );

  await filterProjectsByGlob ( obj );

  fetchTodos ( config, obj );

  filterProjectsByTodo ( config, obj );

  filterGroups ( config, obj );

  const content = Utils.string.stripEmptyLines ( mergeTodos ( config, obj ) );

  if ( content ) {

    Utils.editor.open ( content );

  } else {

    vscode.window.showInformationMessage ( 'You don\'t have any todo files across your projects' );

  }

}

async function todoEmbedded () {

  const config = Config.get (),
        obj = _.cloneDeep ( await ProjectsConfig.get () );

  filterProjectsByConfig ( config, obj );

  await filterProjectsByGlob ( obj );

  await fetchTodosEmbedded ( config, obj );

  filterProjectsByTodo ( config, obj );

  filterGroups ( config, obj );

  const content = mergeTodos ( config, obj );

  if ( content ) {

    Utils.editor.open ( content );

  } else {

    vscode.window.showInformationMessage ( 'You don\'t have any embedded todos across your projects' );

  }

}

/* EXPORT */

export {todo, todoEmbedded};
