import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps  
extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    className, children, disabled, 
    type = "button", ...props
}, ref) => {
    return (
        <button 
            type={type} 
            className={twMerge(
                `w-full rounded-full bg-green-500 border border-transparent px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50 text-black font-bold hover:bg-green-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl`,
                className
            )} 
            disabled={disabled} 
            ref={ref} 
            {...props}
        >
            {children}
        </button>
    )
})

Button.displayName = "Button";
 
export default Button;