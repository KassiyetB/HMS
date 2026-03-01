import React, { createContext, useContext, useState } from "react";

type RadioGroupContextType = {
    name: string;
    selectedValue: string | null;
    internalChange: (value: string) => void;
    required?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

type RadioButtonGroupProps = {
  name: string;
  children: React.ReactNode;
  onChange?: (value: string) => void;
  required?: boolean
};

export function RadioButtonGroup({
    name, 
    children,
    onChange,
    required = false
}:RadioButtonGroupProps){
    const [selectedValue, setSelectedValue] = useState<string | null>(null);

    const handleChange = (value: string) => {
        setSelectedValue(value); // Internal state
        onChange?.(value); // Parent callback
    }

    return (
        <RadioGroupContext.Provider 
            value={{name, selectedValue, internalChange: handleChange, required}}
        >
            <div className="radio-button-group">{children}</div>
        </RadioGroupContext.Provider>
    )
}

type RadioButtonProps = {
  value: string;
};
export function RadioButton({value}:RadioButtonProps){
    const context = useContext(RadioGroupContext);

    if (!context) {
        throw new Error("RadioButton must be used inside RadioButtonGroup");
    }

    const { name, selectedValue, internalChange, required } = context;
    

    return(
        <label className="radio-btn">
            <input 
                type="radio" 
                name={name} 
                value={value} 
                checked={selectedValue===value} 
                onChange={()=> internalChange(value)}
                style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                }} 
                required={required}
            />
            {value}
        </label>
    )
}