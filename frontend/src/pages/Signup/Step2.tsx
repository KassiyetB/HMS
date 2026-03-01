import './Signup.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useOutletContext } from "react-router-dom";
import type { UserObject } from "@/layouts/SignupLayout";

type ContextType = {
  userData: UserObject;
  setUserData: React.Dispatch<React.SetStateAction<UserObject>>;
};


type CountryOption = {
        value: string; // Country code
        phoneCode: string; // The full phone code (e.g., +1)
        label: string; // The country name
        flag: string;  // The flag image URL
    }

export default function Step2() {
    const navigate = useNavigate();
    
    //const {userData, setUserData} = useOutletContext<ContextType>();

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        navigate("/signup/step3");
    }

    const [countries, setCountries] = useState<CountryOption[]>([]);
    const [selected, setSelected] = useState<CountryOption | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string>("");


    const customStyles = {
        // 1. The text shown after selection
        singleValue: (base: any) => ({
            ...base,
            color: 'var(--select-text-color)',
        }),
        // 2. The cursor/search text
        input: (base: any) => ({
            ...base,
            color: 'var(--select-text-color)',
        }),
        // 3. The items in the dropdown
        option: (base: any) => ({
            ...base,
            color: 'black',
        }),
        // 4. The container background
        control: (base: any) => ({
            ...base,
            backgroundColor: 'var(--select-bg)',
            border: '1px solid var(--gray-text)', 
            boxShadow: 'none',
            '&:hover': { border: '3px solid #929292' } // Remove blue border on hover
        }),
        menu: (base: any) => ({
            ...base,
            borderRadius: '8px',
            marginTop: '5px'
        })
    };
    

    useEffect(() => {
        fetch('https://restcountries.com/v3.1/all?fields=name,idd,flags,cca2')
        .then(res=> res.json())
        .then((data: any[]) => {
            const formatted: CountryOption[] = data.map(country => ({
                value: country.cca2,
                phoneCode: country.idd?.root,
                label: country.name.common,
                flag: country.flags.png,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
            setCountries(formatted);
            
            fetch("http://ip-api.com/json/")
            .then(response => response.json())
            .then((data)=> {
                const detectedCountry = formatted.find(c => c.value === data.countryCode);
                if(detectedCountry){
                    setSelected(detectedCountry);
                }
            })
        })
        .catch(err => console.error("Error initialization:", err));
    
    }, []);

    return(
        <form className='Signup-form' onSubmit={handleSubmit}>
            <h1>Sign up</h1>
            <p>Please confirm your country code and enter your phone number</p> 
            <div id="s-input-1" className="signup-input-phone">
                <hr />
                <Select
                    styles={customStyles} 
                    options={countries}
                    value={selected}
                    onChange={(option) => setSelected(option)}
                    formatOptionLabel={country => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img src={country.flag} alt="" style={{ width: 20, marginRight: 10 }} />
                            <span>{country.label}</span>
                        </div>
                    )}
                    required

                />
                <hr />
                <div style={{display: "flex", gap:"15px", alignItems:"center"}}>
                    <p className='country-code'>{selected?.phoneCode}</p>
                    <div className='vertical-line'></div>
                    <input 
                        type='tel' 
                        className='phone-number' 
                        value={phoneNumber}
                        onChange={(e)=> setPhoneNumber(e.target.value)}
                        pattern='[0-9]{3} [0-9]{3} [0-9]{2} [0-9]{2}' 
                        placeholder='000 000 00 00' 
                        required 
                    />
                </div>
                <hr />
            </div>
            <div id="s-input-2" className="signup-input">
                <label htmlFor="password">Password</label>
                <br />
                <input id="password" type="password" placeholder="must be 8 characters" />
            </div>
            <div id="s-input-3" className="signup-input">
                <label htmlFor="repeat-password">Confirm password</label>
                <br />
                <input id="repeat-password" type="password" placeholder="repeat password" />
            </div>
            <div className='submit-btn-aligner'>
                <input type="submit" value="Continue"></input>
            </div>
        </form>
    )
}