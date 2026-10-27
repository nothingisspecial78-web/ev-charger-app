import React from 'react';
import { fieldClassName } from './FormField';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={fieldClassName(className)} {...props} />
);
Input.displayName = 'Input';
