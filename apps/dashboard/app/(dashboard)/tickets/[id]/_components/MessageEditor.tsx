'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import CodeBlock from '@tiptap/extension-code-block'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Code,
  FileCode,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react'

interface MessageEditorProps {
  content: string
  onChange: (content: string) => void
  onSubmit: (visibility: 'public' | 'internal') => void
  onAIReply?: () => Promise<void>
  disabled?: boolean
  isGeneratingAIReply?: boolean
  placeholder?: string
}

const MenuButton = ({ 
  isActive, 
  onClick, 
  children, 
  disabled,
  tooltip
}: { 
  isActive?: boolean
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  tooltip?: string
}) => (
  <Button
    type="button"
    variant={isActive ? "secondary" : "ghost"}
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "h-8 w-8",
      isActive && "bg-muted",
      "hover:bg-muted"
    )}
    title={tooltip}
  >
    {children}
  </Button>
)

export function MessageEditor({ 
  content, 
  onChange, 
  onSubmit,
  onAIReply,
  disabled = false,
  isGeneratingAIReply = false,
  placeholder = "Write your message here..." 
}: MessageEditorProps) {
  const [isInternal, setIsInternal] = React.useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        code: {
          HTMLAttributes: {
            class: 'rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono font-medium',
          },
        },
        heading: {
          levels: [1, 2],
        },
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'rounded-md bg-muted p-4 font-mono',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none rounded-b-md bg-background',
          disabled && 'opacity-50 cursor-not-allowed'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Add effect to update editor content when prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col border rounded-md">
      <div className="border-b bg-muted/50">
        <div className="flex flex-wrap items-center gap-1 p-1">
          <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={disabled || !editor.can().undo()}
              tooltip="Undo"
            >
              <Undo className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={disabled || !editor.can().redo()}
              tooltip="Redo"
            >
              <Redo className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={disabled}
              isActive={editor.isActive('heading', { level: 1 })}
              tooltip="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={disabled}
              isActive={editor.isActive('heading', { level: 2 })}
              tooltip="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={disabled}
              isActive={editor.isActive('bold')}
              tooltip="Bold"
            >
              <Bold className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={disabled}
              isActive={editor.isActive('italic')}
              tooltip="Italic"
            >
              <Italic className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={disabled}
              isActive={editor.isActive('code')}
              tooltip="Inline Code"
            >
              <Code className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={disabled}
              isActive={editor.isActive('bulletList')}
              tooltip="Bullet List"
            >
              <List className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={disabled}
              isActive={editor.isActive('orderedList')}
              tooltip="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </MenuButton>
          </div>

          <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              disabled={disabled}
              isActive={editor.isActive('codeBlock')}
              tooltip="Code Block"
            >
              <FileCode className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              disabled={disabled}
              isActive={editor.isActive('blockquote')}
              tooltip="Quote"
            >
              <Quote className="h-4 w-4" />
            </MenuButton>
          </div>

          <MenuButton
            onClick={() => {
              const url = window.prompt('Enter URL')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            disabled={disabled}
            isActive={editor.isActive('link')}
            tooltip="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </MenuButton>

          {onAIReply && (
            <div className="flex items-center gap-0.5 pl-2 border-l ml-2">
              <Button
                onClick={onAIReply}
                disabled={disabled || isGeneratingAIReply}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGeneratingAIReply ? 'Generating...' : 'AI Reply'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="flex justify-between items-center p-2 border-t bg-muted/50">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Use Markdown shortcuts (e.g., ** for bold, * for italic)
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsInternal(!isInternal)}
            className={cn(
              "gap-2",
              isInternal && "bg-yellow-100 hover:bg-yellow-200 text-yellow-900"
            )}
          >
            {isInternal ? (
              <>
                <EyeOff className="h-4 w-4" />
                Internal Note
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Public Message
              </>
            )}
          </Button>
        </div>
        <Button
          onClick={() => onSubmit(isInternal ? 'internal' : 'public')}
          disabled={disabled || !editor.getText().trim()}
          size="sm"
        >
          Send Message
        </Button>
      </div>
    </div>
  )
} 