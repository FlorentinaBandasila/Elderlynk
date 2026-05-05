const styles = {
  green:      { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' },
  yellow:     { backgroundColor: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' },
  red:        { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' },
  blue:       { backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
  cyan:       { backgroundColor: '#cffafe', color: '#0e7490', border: '1px solid #a5f3fc' },
  gray:       { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
  purple:     { backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' },
  orange:     { backgroundColor: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' },
  watermelon: { backgroundColor: '#ffe4e6', color: '#be123c', border: '1px solid #fecdd3' },
}

export default function Badge({ variant = 'gray', children, className = '' }) {
  return (
    <span
      style={styles[variant] || styles.gray}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  )
}
