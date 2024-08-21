// app/routes/thread-qwerty.jsx
import { useState } from "react";

export default function ThreadQwerty() {
  const [message, setMessage] = useState("");

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle message submission here
    console.log(message);
    setMessage("");
  };

  return (
    
  );
}
