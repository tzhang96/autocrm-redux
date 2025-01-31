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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  CheckCircle2,
  XCircle,
} from 'lucide-react'

interface MessageEditorProps {
  content: string
  onChange: (content: string) => void
  onSubmit: (visibility: 'public' | 'internal') => void
  onAIReply?: () => Promise<void>
  onAICheck?: () => Promise<{ isValid: boolean; message: string }>
  disabled?: boolean
  isGeneratingAIReply?: boolean
  isCheckingMessage?: boolean
  placeholder?: string
  ticketContext?: string
  messageHistory?: string
  documentationContext?: string
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
  onAICheck,
  disabled = false,
  isGeneratingAIReply = false,
  isCheckingMessage = false,
  placeholder = "Write your message here...",
  ticketContext,
  messageHistory,
  documentationContext
}: MessageEditorProps) {
  const [isInternal, setIsInternal] = React.useState(false)
  const [checkerFeedback, setCheckerFeedback] = React.useState<{ isValid: boolean; message: string } | null>(null)
  const [tooltipOpen, setTooltipOpen] = React.useState(false)

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
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4'
          }
        }
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
    parseOptions: {
      preserveWhitespace: 'full'
    },
  })

  // Add effect to update editor content when prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleAICheck = async () => {
    if (!onAICheck) return
    try {
      const feedback = await onAICheck()
      setCheckerFeedback(feedback)
      setTooltipOpen(true)
    } catch (error) {
      console.error('Error checking message:', error)
    }
  }

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

          <div className="flex items-center gap-0.5">
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
          </div>
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="border-t bg-muted/50 p-2 mt-auto">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {onAICheck && (
              <TooltipProvider>
                <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAICheck}
                      disabled={disabled || isCheckingMessage || !editor?.getText()?.trim()}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isCheckingMessage ? 'Checking...' : 'AI Checker'}
                    </Button>
                  </TooltipTrigger>
                  {checkerFeedback && (
                    <TooltipContent 
                      side="top" 
                      align="end"
                      className={cn(
                        "max-w-sm p-4 space-y-2",
                        checkerFeedback.isValid ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {checkerFeedback.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {checkerFeedback.isValid ? "Message Looks Good!" : "Message Needs Review"}
                          </p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">
                            {checkerFeedback.message}
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
            {onAIReply && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onAIReply}
                disabled={disabled || isGeneratingAIReply}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGeneratingAIReply ? 'Generating...' : 'AI Reply'}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsInternal(!isInternal)}
              className="gap-2"
            >
              {isInternal ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Internal
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Public
                </>
              )}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={disabled || !editor?.getText()?.trim()}
              onClick={() => onSubmit(isInternal ? 'internal' : 'public')}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 