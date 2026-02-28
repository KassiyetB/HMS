import React, { createContext, useContext } from "react";

const RadioGroupContext = createContext<string | null>(null);

type RadioButtonGroupProps = {
  name: string;
  children: React.ReactNode;
};

export function RadioButtonGroup({name, children}:RadioButtonGroupProps){
    return (
        <RadioGroupContext.Provider value={name}>
            <div className="radio-button-group">{children}</div>
        </RadioGroupContext.Provider>
    )
}

type RadioButtonProps = {
  value: string;
};
export function RadioButton({value}:RadioButtonProps){
    const name = useContext(RadioGroupContext);

    if (!name) {
        throw new Error("RadioButton must be used inside RadioButtonGroup");
    }

    return(
        <label className="radio-btn">
            <input type="radio" name={name} value={value} style={{display:"None"}} />
            {value}
        </label>
    )
}