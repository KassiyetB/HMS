import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export type UserObject = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
  password: string;
};

export default function SignupLayout() {
  const [userData, setUserData] = useState<UserObject>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone_number: "",
    password: "",
  });

  useEffect(()=>{
    console.log(userData);
  })

  return (
    <Outlet context={{ userData, setUserData }} />
  );
}