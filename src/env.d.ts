// This file tells TypeScript to treat .vue files as modules, allowing you to import them in your TypeScript code without type errors. It also provides a generic type definition for Vue components, which can be useful for type checking and autocompletion in your IDE.

declare module '*.vue' {
  import type { defineComponent } from 'vue'

  // A generic type definition for all Vue components
  // object = props, object = data, unknown = other internals
  const component: DefineComponent<object, object, unknown>
  export default component
}
