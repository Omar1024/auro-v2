interface LogoProps {
  className?: string
  textClassName?: string
  iconClassName?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ 
  className = "", 
  textClassName = "",
  iconClassName = "",
  showText = true,
  size = "md"
}: LogoProps) {
  const sizes = {
    sm: { container: "gap-1.5", icon: "w-6 h-6", text: "text-base" },
    md: { container: "gap-2", icon: "w-8 h-8", text: "text-xl" },
    lg: { container: "gap-3", icon: "w-10 h-10", text: "text-2xl" }
  }

  const sizeClasses = sizes[size]

  return (
    <div className={`flex items-center ${sizeClasses.container} ${className}`}>
      {/* Infinity Logo SVG */}
      <svg 
        className={`${sizeClasses.icon} ${iconClassName}`}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12ZM12 12C12 14.2091 10.2091 16 8 16C5.79086 16 4 14.2091 4 12C4 9.79086 5.79086 8 8 8C10.2091 8 12 9.79086 12 12Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      {showText && (
        <span className={`font-bold tracking-tight ${sizeClasses.text} ${textClassName}`}>
          Auro
        </span>
      )}
    </div>
  )
}


