'use client'

import { useState } from 'react'

export function CopySnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
    >
      {copied ? 'Copied!' : 'Copy embed code'}
    </button>
  )
}
