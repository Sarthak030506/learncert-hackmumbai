import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  fullWidth = false,
  className = "",
  ...props 
}) => {
  const baseStyles = "h-12 px-6 rounded-xl transition-all duration-500 font-black uppercase tracking-[0.1em] text-[11px] flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-white text-black hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-white/5",
    secondary: "premium-glass text-white border-white/10 hover:border-white/20 hover:bg-white/5 active:scale-[0.97]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
