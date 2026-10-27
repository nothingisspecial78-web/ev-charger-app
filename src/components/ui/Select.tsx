import React from 'react';
import { fieldClassName } from './FormField';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={fieldClassName(`text-sm ${className || ''}`)} {...props} />
);
Select.displayName = 'Select';
