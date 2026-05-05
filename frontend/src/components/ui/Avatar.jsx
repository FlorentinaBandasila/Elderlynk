const colors = [
  { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  { backgroundColor: '#dcfce7', color: '#15803d' },
  { backgroundColor: '#fce7f3', color: '#9d174d' },
  { backgroundColor: '#fef9c3', color: '#a16207' },
  { backgroundColor: '#f3e8ff', color: '#7e22ce' },
  { backgroundColor: '#ffedd5', color: '#c2410c' },
]

export default function Avatar({ name = '', size = 'md' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const color = colors[name.charCodeAt(0) % colors.length]
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}
      style={color}
    >
      {initials}
    </div>
  )
}
