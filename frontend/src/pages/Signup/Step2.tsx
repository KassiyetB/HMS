import './Signup.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useOutletContext } from "react-router-dom";
import type { UserObject } from "@/layouts/SignupLayout";
import { AsYouType, getExampleNumber, isValidNumber, getCountryCallingCode, isSupportedCountry } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import type { CountryCode } from "libphonenumber-js";

type ContextType = {
  userData: UserObject;
  setUserData: React.Dispatch<React.SetStateAction<UserObject>>;
};

type CountryOption = {
  value: CountryCode; // ISO alpha-2 country code
  phoneCode: string;  // Full phone code (e.g., +1)
  label: string;      // Country name
  flag: string;       // Flag image URL
}

export default function Step2() {
  const navigate = useNavigate();
  const { userData, setUserData } = useOutletContext<ContextType>();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selected, setSelected] = useState<CountryOption | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Handle phone input formatting
  const handlePhoneNumberChange = (value: string, previousValue: string) => {
    let newValue = value;

    // Detect backspace and remove extra formatting chars
    if (previousValue.length > value.length) {
      const lastChar = previousValue[previousValue.length - 1];
      if (lastChar === ')' || lastChar === '-' || lastChar === ' ') {
        newValue = previousValue.slice(0, -2);
      }
    }

    const formatter = new AsYouType(selected?.value || "US");
    const formattedNumber = formatter.input(newValue);

    setPhoneNumber(formattedNumber);

    // Update userData with full formatted number
    setUserData(prev => ({
      ...prev,
      phone_number: `${selected?.phoneCode} ${formattedNumber}`
    }));
  };

  // Placeholder example
  const getPhoneNumberPlaceholder = (): string => {
    if (!selected?.value) return "";
    const example = getExampleNumber(selected.value as CountryCode, examples);
    if (!example) return "";
    const raw = example.nationalNumber;
    const formatter = new AsYouType(selected.value as CountryCode);
    return formatter.input(raw);
  };

  // Submit handler with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = selected && isValidNumber(userData.phone_number, selected?.value);
    if (valid) {
      navigate("/signup/step3");
    } else {
      alert("Entered phone number is invalid. Try again!");
    }
  };

  // Custom styles for react-select
  const customStyles = {
    singleValue: (base: any) => ({ ...base, color: 'var(--select-text-color)' }),
    input: (base: any) => ({ ...base, color: 'var(--select-text-color)' }),
    option: (base: any) => ({ ...base, color: 'black' }),
    control: (base: any) => ({
      ...base,
      backgroundColor: 'var(--select-bg)',
      border: '1px solid var(--gray-text)',
      boxShadow: 'none',
      '&:hover': { border: '3px solid #929292' }
    }),
    menu: (base: any) => ({ ...base, borderRadius: '8px', marginTop: '5px' })
  };

  // Fetch countries and filter only supported ones
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2')
      .then(res => res.json())
      .then((data: any[]) => {
        const formatted: CountryOption[] = data
          .filter(country => isSupportedCountry(country.cca2)) // Only supported by libphonenumber-js
          .map(country => ({
            value: country.cca2,
            phoneCode: `+${getCountryCallingCode(country.cca2)}`,
            label: country.name.common,
            flag: country.flags.png,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setCountries(formatted);

        // Detect user country by IP
        fetch("http://ip-api.com/json/")
          .then(resp => resp.json())
          .then(ipData => {
            const detected = formatted.find(c => c.value === ipData.countryCode);
            if (detected) setSelected(detected);
          })
          .catch(() => {}); // ignore IP errors
      })
      .catch(err => console.error("Error fetching countries:", err));
  }, []);

  return (
    <form className='Signup-form' onSubmit={handleSubmit}>
      <h1>Sign up</h1>
      <p>Please confirm your country code and enter your phone number</p>

      <div id="s-input-1" className="signup-input-phone">
        <hr />
        <Select
          styles={customStyles}
          options={countries}
          value={selected}
          onChange={option => setSelected(option)}
          formatOptionLabel={country => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={country.flag} alt="" style={{ width: 20, marginRight: 10 }} />
              <span>{country.label}</span>
            </div>
          )}
          required
        />
        <hr />
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <p className='country-code'>{selected?.phoneCode}</p>
          <div className='vertical-line'></div>
          <input
            type='text'
            className='phone-number'
            value={phoneNumber}
            onChange={e => handlePhoneNumberChange(e.target.value, phoneNumber)}
            placeholder={getPhoneNumberPlaceholder()}
            required
          />
        </div>
        <hr />
      </div>

      <div id="s-input-2" className="signup-input">
        <label htmlFor="password">Password</label>
        <br />
        <input
          id="password"
          type="password"
          placeholder="must be 8 characters"
          minLength={8}
        />
      </div>

      <div id="s-input-3" className="signup-input">
        <label htmlFor="repeat-password">Confirm password</label>
        <br />
        <input
          id="repeat-password"
          type="password"
          placeholder="repeat password"
          minLength={8}
        />
      </div>

      <div className='submit-btn-aligner'>
        <input type="submit" value="Continue" />
      </div>
    </form>
  )
}