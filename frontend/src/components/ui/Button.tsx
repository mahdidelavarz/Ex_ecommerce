// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Icon } from '@iconify/react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover',
  secondary: 'bg-secondary text-white hover:bg-secondary-hover active:bg-secondary-hover',
  outline: 'border-2 border-primary text-primary hover:bg-primary-light active:bg-primary-light',
  ghost: 'text-primary hover:bg-primary-light active:bg-primary-light',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-button
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
        ) : icon ? (
          <Icon icon={icon} className="w-5 h-5" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;