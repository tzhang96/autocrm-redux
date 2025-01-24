declare module 'react-markdown' {
  import { ComponentType, ReactNode } from 'react'

  interface ReactMarkdownProps {
    children: string
    components?: Record<string, ComponentType<any>>
    rehypePlugins?: any[]
  }

  const ReactMarkdown: ComponentType<ReactMarkdownProps>
  export default ReactMarkdown
}

declare module 'rehype-raw' {
  const rehypeRaw: any
  export default rehypeRaw
}

declare module 'rehype-sanitize' {
  const rehypeSanitize: any
  export default rehypeSanitize
} 