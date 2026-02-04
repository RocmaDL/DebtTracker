import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ onClick, variant = 'primary', className = "", children, ...props }) => {
  const variants = {
    primary: "bg-blue-600 text-white active:bg-blue-700 md:hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/20",
    secondary: "bg-slate-100 text-slate-700 active:bg-slate-200 md:hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600",
    danger: "bg-red-50 text-red-600 active:bg-red-100 md:hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
    success: "bg-emerald-600 text-white active:bg-emerald-700 md:hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20",
    outline: "border-2 border-slate-200 text-slate-600 active:bg-slate-50 md:hover:border-slate-300 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
  };
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 md:py-2.5 rounded-xl font-bold md:font-medium transition-all transform active:scale-95 flex items-center justify-center gap-2 touch-manipulation ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
