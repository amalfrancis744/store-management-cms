import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const inputVariants = cva(
  'flex w-full rounded-lg border px-3 py-2 text-sm bg-white transition-all duration-200 focus:outline-0  placeholder:text-gray-400',
  {
    variants: {
      variant: {
        default: 'border-gray-300 hover:border-gray-400  ',
        field: 'border-blue-500 focus:border-blue-500 ',
        error: 'border-red-500 focus:border-red-500 ',
        success: 'border-green-600 focus:border-green-600',
      },
      size: {
        small: 'h-8 text-xs',
        medium: 'h-10 text-sm',
        large: 'h-12 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'large',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  hintText?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  width?: number | string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    type = 'text',
    label,
    hintText,
    error,
    success,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    width,
    style,
    
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    // Determine variant based on props
    const getVariant = () => {
      if (error) return 'error';
      if (success) return 'success';
      return variant || 'default';
    };

    const currentVariant = getVariant();

    const getHintTextColor = () => {
      switch (currentVariant) {
        case 'error':
          return 'text-red-500';
        case 'success':
          return 'text-green-600';
        default:
          return 'text-gray-500';
      }
    };

    const getStatusIcon = () => {
      if (currentVariant === 'error') {
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      }
      if (currentVariant === 'success') {
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      }
      return null;
    };

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasLeftIcon = LeftIcon;
    const hasRightContent = RightIcon || type === 'password' || getStatusIcon();

    const customStyle = {
      ...style,
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    };

    return (
      <div className="w-full" style={customStyle}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          <div className="relative flex items-center">
            {hasLeftIcon && (
              <div className="absolute left-3 z-10 pointer-events-none">
                <LeftIcon className="w-4 h-4 text-gray-400" />
              </div>
            )}
            
            <input
              ref={ref}
              type={inputType}
              className={cn(
                inputVariants({ variant: currentVariant, size }),
                hasLeftIcon && 'pl-10',
                hasRightContent && 'pr-10',
                className
              )}
              {...props}
            />
            
            {hasRightContent && (
              <div className="absolute right-3 flex items-center space-x-1">
                {type === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
                
                {RightIcon && !getStatusIcon() && type !== 'password' && (
                  <div className="pointer-events-none">
                    <RightIcon className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                
                {getStatusIcon()}
              </div>
            )}
          </div>
        </div>
        
        {(hintText || error) && (
          <p className={cn('text-xs mt-1', getHintTextColor())}>
            {error || hintText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };