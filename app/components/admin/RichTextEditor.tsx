'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import 'react-quill-new/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues with 'document is not defined'
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface RichTextEditorProps {
  name: string
  defaultValue?: string
  placeholder?: string
}

export default function RichTextEditor({ name, defaultValue, placeholder }: RichTextEditorProps) {
  const [value, setValue] = useState(defaultValue || '')
  
  // Custom toolbar format for standard formatting
  const modules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value} />
      <div className="bg-surface-container-lowest text-on-surface rounded-xl overflow-hidden [&_.ql-toolbar]:bg-surface-container-low [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-white/5 [&_.ql-container]:border-none [&_.ql-container]:font-sans [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-on-surface [&_.ql-stroke]:stroke-on-surface-variant [&_.ql-fill]:fill-on-surface-variant [&_.ql-picker]:text-on-surface-variant ring-1 ring-inset ring-white/10 focus-within:ring-primary shadow-inner">
        <ReactQuill 
          theme="snow" 
          value={value} 
          onChange={setValue} 
          modules={modules}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
