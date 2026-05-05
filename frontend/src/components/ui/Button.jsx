const variants = {
  primary: { backgroundColor: '#0f4c81', color: '#fff', border: '1px solid #0f4c81' },
  cyan:    { backgroundColor: '#00b4d8', color: '#fff', border: '1px solid #00b4d8' },
  outline: { backgroundColor: 'transparent', color: '#0f4c81', border: '1px solid #0f4c81' },
  danger:  { backgroundColor: '#e63946', color: '#fff', border: '1px solid #e63946' },
  ghost:   { backgroundColor: 'transparent', color: '#475569', border: '1px solid transparent' },
  success: { backgroundColor: '#16a34a', color: '#fff', border: '1px solid #16a34a' },
  warning: { backgroundColor: '#d97706', color: '#fff', border: '1px solid #d97706' },
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export default function Button({ variant = 'primary', size = 'md', children, className = '', disabled, ...props }) {
  return (
    <button
      style={variants[variant] || variants.primary}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
