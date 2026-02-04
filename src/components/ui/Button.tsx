import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const Button = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  className,
  loading,
  disabled
}: ButtonProps) => {

  const baseStyles = "flex-row items-center justify-center rounded-2xl transition-all active:opacity-90";

  const variants = {
    primary: "bg-blue-600 shadow-lg shadow-blue-500/20",
    secondary: "bg-slate-100 dark:bg-slate-800",
    danger: "bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30",
    success: "bg-emerald-500 shadow-lg shadow-emerald-500/20",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
  };

  const textColors = {
    primary: "text-white",
    secondary: "text-slate-900 dark:text-white",
    danger: "text-white",
    success: "text-white",
    ghost: "text-slate-600 dark:text-slate-400"
  };

  const sizes = {
    sm: "px-3 py-2",
    md: "px-5 py-3.5",
    lg: "px-6 py-4"
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={twMerge(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && "opacity-50",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#334155' : 'white'} />
      ) : (
        <Text className={twMerge("font-bold text-center", textColors[variant])}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};
