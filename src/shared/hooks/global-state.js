import { useState } from "react";

const useGlobalState = () => {
  const [currentUserDetails, setCurrentUserDetails] = useState("");
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [adminMessages, setAdminMessages] = useState([]);
  const [isMessagesFetch, setIsMessagesFetch] = useState(false);

  return {
    currentUserDetails,
    setCurrentUserDetails,
    isAppAdmin,
    setIsAppAdmin,
    adminMessages,
    setAdminMessages,
    isMessagesFetch,
    setIsMessagesFetch,
  };
};

export default useGlobalState;
