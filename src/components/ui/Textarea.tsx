import React from 'react';
import { fieldClassName } from './FormField';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={fieldClassName(`py-3 ${className || ''}`)} {...props} />
);
Textarea.displayName = 'Textarea';
