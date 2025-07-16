"use client";
import React, { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import clsx from "clsx";

interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: FieldError | string;
  helperText?: string;
  variant?: "outline" | "filled";
  size?: "sm" | "md" | "lg";
  required?: boolean;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      variant = "outline",
      size = "md",
      required = false,
      className,
      type = "text",
      ...props
    },
    ref
  ) => {
    const errorMessage = typeof error === "string" ? error : error?.message;

    const inputClasses = clsx(
      "w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark/20",
      {
        // Variant styles
        "border-gray-3 bg-white focus:border-dark": variant === "outline",
        "border-transparent bg-gray-1 focus:bg-white focus:border-dark": variant === "filled",
        
        // Size styles
        "px-3 py-2 text-sm": size === "sm",
        "px-4 py-3 text-base": size === "md",
        "px-5 py-4 text-lg": size === "lg",
        
        // Error styles
        "border-red-500 focus:border-red-500 focus:ring-red-500/20": errorMessage,
        
        // Disabled styles
        "opacity-60 cursor-not-allowed bg-gray-100": props.disabled,
      },
      className
    );

    const labelClasses = clsx(
      "block text-sm font-medium mb-2 transition-colors",
      {
        "text-gray-700": !errorMessage,
        "text-red-600": errorMessage,
      }
    );

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id || props.name} className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            aria-invalid={!!errorMessage}
            aria-describedby={
              errorMessage
                ? `${props.name}-error`
                : helperText
                ? `${props.name}-help`
                : undefined
            }
            {...props}
          />
        </div>

        {errorMessage && (
          <p
            id={`${props.name}-error`}
            className="mt-1 text-sm text-red-600 flex items-center"
            role="alert"
          >
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        )}

        {helperText && !errorMessage && (
          <p
            id={`${props.name}-help`}
            className="mt-1 text-sm text-gray-600"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField; 