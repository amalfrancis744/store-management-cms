import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      type: {
        primary: 'text-white shadow-sm bg-[#008080] hover:bg-[#006E6E]',
        secondary: 'bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200',
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50',
      },
      state: {
        default: '',
        hover: '',
        disabled: 'opacity-50 pointer-events-none',
      },
      size: {
        small: 'h-8 px-3 text-sm rounded-md gap-2',
        medium: 'h-10 px-4 text-sm rounded-md gap-2', 
        large: 'h-[46px] px-[10px] text-base rounded-lg gap-[10px]',
      },
    },
    defaultVariants: {
      type: 'primary',
      state: 'default',
      size: 'large',
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: 'none' | 'home-outline' | string;
  label?: string;
  width?: number | string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    type, 
    state, 
    size, 
    asChild = false, 
    icon = 'none',
    label = 'Label',
    width,
    children,
    style,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const customStyle = {
      ...style,
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ type, state, size, className }))}
        style={customStyle}
        ref={ref}
        {...props}
      >
        {icon !== 'none' && (
          <span className="w-4 h-4 flex-shrink-0">
            {/* Icon placeholder - replace with your actual icon component */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </span>
        )}
        {children || label}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };