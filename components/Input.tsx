import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps 
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    className,
    type,
    disabled,
    label,
    description,
    id,
    ...props
}, ref) => {
     return (
        <div className="w-full">
            {label && (
                <label 
                    htmlFor={id}
                    className="text-neutral-400 text-sm mb-1 block"
                >
                    {label}
                </label>
            )}
            <input 
                id={id}
                type={type}
                className={twMerge(`
                    flex w-full rounded-md bg-neutral-700 border border-transparent px-3 py-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none
                `, className)}
                disabled={disabled}
                ref={ref}
                {...props}
            />
            {description && (
                <p className="text-neutral-500 text-xs mt-1">
                    {description}
                </p>
            )}
        </div>
    )
})

Input.displayName = "Input";
 
export default Input;