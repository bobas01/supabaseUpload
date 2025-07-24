import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function UploadForm({ user, onUpload }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    let { error: uploadError } = await supabase
      .storage
      .from("user-image")
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data } = supabase
      .storage
      .from("user-image")
      .getPublicUrl(filePath);

    console.log("user.id utilisé pour user_id :", user.id);
    await supabase.from("images").insert([
      { user_id: user.id, path: filePath }
    ]);

    setFile(null);
    onUpload();
  };

  return (
    <form onSubmit={handleUpload}>
      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files[0])}
        required
      />
      <button type="submit">Uploader</button>
      {error && <p style={{color:"red"}}>{error}</p>}
    </form>
  );
}
