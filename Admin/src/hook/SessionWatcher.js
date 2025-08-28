import { useEffect } from "react";
import axios from "axios";

export default function useSessionWatcher() {
  useEffect(() => {
    // Run check every 10 seconds (adjust as needed)
    const interval = setInterval(() => {
      axios
        .get("https://caferealitea.onrender.com/check_session", {
          withCredentials: true,
        })
        .then((res) => {
          if (!res.data.valid) {
            handleLogout();
          }
        })
        .catch((err) => {
          if (
            err.response &&
            (err.response.status === 401 || err.response.status === 403)
          ) {
            handleLogout();
          }
        });
    }, 60000); // 10 sec, not too heavy

    // ✅ Clear interval when component unmounts
    return () => clearInterval(interval);
  }, []); // 👈 empty dependency array = run only once

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };
}
