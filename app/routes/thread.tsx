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
    <div>
      <h1>Thread Qwerty</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Message:
          <input type="text" value={message} onChange={handleMessageChange} />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
