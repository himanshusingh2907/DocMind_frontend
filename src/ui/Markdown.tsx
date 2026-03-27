import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ node, ...props }) => (
          <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
        ),
        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 last:mb-0" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 last:mb-0" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1 last:mb-0" {...props} />,
        code: (props) => {
          const p = props as any
          const { inline, className, children, ...rest } = p
          const raw = Array.isArray(children) ? children.join('') : (children as string)
          if (inline) {
            return (
              <code
                className="px-1 py-0.5 rounded-md bg-white/5 border border-white/10 text-indigo-200 text-[0.95em]"
                {...rest}
              >
                {children}
              </code>
            )
          }
          return (
            <pre className="mb-2 rounded-2xl bg-black/30 border border-white/10 overflow-x-auto">
              <code className={className ?? ''} {...rest}>
                {raw}
              </code>
            </pre>
          )
        },
        a: ({ node, ...props }) => (
          <a className="text-indigo-200 underline underline-offset-3 hover:text-white" target="_blank" rel="noreferrer" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

