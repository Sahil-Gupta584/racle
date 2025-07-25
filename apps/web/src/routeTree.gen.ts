/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as ProtectedRouteImport } from './routes/_protected'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ProtectedProjectsIndexRouteImport } from './routes/_protected/projects/index'
import { Route as ProtectedProjectsProjectIdIndexRouteImport } from './routes/_protected/projects/$projectId/index'
import { Route as ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRouteImport } from './routes/_protected/projects/$projectId/deployment/$deploymentId/index'

const AuthRoute = AuthRouteImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRouteImport,
} as any)
const ProtectedRoute = ProtectedRouteImport.update({
  id: '/_protected',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const ProtectedProjectsIndexRoute = ProtectedProjectsIndexRouteImport.update({
  id: '/projects/',
  path: '/projects/',
  getParentRoute: () => ProtectedRoute,
} as any)
const ProtectedProjectsProjectIdIndexRoute =
  ProtectedProjectsProjectIdIndexRouteImport.update({
    id: '/projects/$projectId/',
    path: '/projects/$projectId/',
    getParentRoute: () => ProtectedRoute,
  } as any)
const ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRoute =
  ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRouteImport.update({
    id: '/projects/$projectId/deployment/$deploymentId/',
    path: '/projects/$projectId/deployment/$deploymentId/',
    getParentRoute: () => ProtectedRoute,
  } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/projects': typeof ProtectedProjectsIndexRoute
  '/projects/$projectId': typeof ProtectedProjectsProjectIdIndexRoute
  '/projects/$projectId/deployment/$deploymentId': typeof ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/auth': typeof AuthRoute
  '/projects': typeof ProtectedProjectsIndexRoute
  '/projects/$projectId': typeof ProtectedProjectsProjectIdIndexRoute
  '/projects/$projectId/deployment/$deploymentId': typeof ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/_protected': typeof ProtectedRouteWithChildren
  '/auth': typeof AuthRoute
  '/_protected/projects/': typeof ProtectedProjectsIndexRoute
  '/_protected/projects/$projectId/': typeof ProtectedProjectsProjectIdIndexRoute
  '/_protected/projects/$projectId/deployment/$deploymentId/': typeof ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/auth'
    | '/projects'
    | '/projects/$projectId'
    | '/projects/$projectId/deployment/$deploymentId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/auth'
    | '/projects'
    | '/projects/$projectId'
    | '/projects/$projectId/deployment/$deploymentId'
  id:
    | '__root__'
    | '/'
    | '/_protected'
    | '/auth'
    | '/_protected/projects/'
    | '/_protected/projects/$projectId/'
    | '/_protected/projects/$projectId/deployment/$deploymentId/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ProtectedRoute: typeof ProtectedRouteWithChildren
  AuthRoute: typeof AuthRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_protected': {
      id: '/_protected'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof ProtectedRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_protected/projects/': {
      id: '/_protected/projects/'
      path: '/projects'
      fullPath: '/projects'
      preLoaderRoute: typeof ProtectedProjectsIndexRouteImport
      parentRoute: typeof ProtectedRoute
    }
    '/_protected/projects/$projectId/': {
      id: '/_protected/projects/$projectId/'
      path: '/projects/$projectId'
      fullPath: '/projects/$projectId'
      preLoaderRoute: typeof ProtectedProjectsProjectIdIndexRouteImport
      parentRoute: typeof ProtectedRoute
    }
    '/_protected/projects/$projectId/deployment/$deploymentId/': {
      id: '/_protected/projects/$projectId/deployment/$deploymentId/'
      path: '/projects/$projectId/deployment/$deploymentId'
      fullPath: '/projects/$projectId/deployment/$deploymentId'
      preLoaderRoute: typeof ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRouteImport
      parentRoute: typeof ProtectedRoute
    }
  }
}

interface ProtectedRouteChildren {
  ProtectedProjectsIndexRoute: typeof ProtectedProjectsIndexRoute
  ProtectedProjectsProjectIdIndexRoute: typeof ProtectedProjectsProjectIdIndexRoute
  ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRoute: typeof ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRoute
}

const ProtectedRouteChildren: ProtectedRouteChildren = {
  ProtectedProjectsIndexRoute: ProtectedProjectsIndexRoute,
  ProtectedProjectsProjectIdIndexRoute: ProtectedProjectsProjectIdIndexRoute,
  ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRoute:
    ProtectedProjectsProjectIdDeploymentDeploymentIdIndexRoute,
}

const ProtectedRouteWithChildren = ProtectedRoute._addFileChildren(
  ProtectedRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ProtectedRoute: ProtectedRouteWithChildren,
  AuthRoute: AuthRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
