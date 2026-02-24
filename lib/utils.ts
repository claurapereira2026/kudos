export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function sourceBadgeColor(source: string): string {
  switch (source) {
    case 'twitter': return 'bg-sky-100 text-sky-700'
    case 'linkedin': return 'bg-blue-100 text-blue-700'
    case 'producthunt': return 'bg-orange-100 text-orange-700'
    case 'form': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function sourceLabel(source: string): string {
  switch (source) {
    case 'twitter': return 'Twitter'
    case 'linkedin': return 'LinkedIn'
    case 'producthunt': return 'Product Hunt'
    case 'form': return 'Form'
    default: return 'Manual'
  }
}
