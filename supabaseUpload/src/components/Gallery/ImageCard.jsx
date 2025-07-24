import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function ImageCard({ img, onDelete }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    async function getUrl() {
      const { data, error } = await supabase
        .storage
        .from("user-image")
        .createSignedUrl(img.path, 60 * 60); 
      if (data) setUrl(data.signedUrl);
    }
    getUrl();
  }, [img.path]);

  return (
    <div style={{border:"1px solid #ccc", padding:"5px", textAlign:"center"}}>
      <img src={url} alt="miniature" style={{width:"100%", maxHeight:"120px", objectFit:"cover"}} />
      <button onClick={() => onDelete(img.id, url)} style={{marginTop:"5px"}}>Supprimer</button>
    </div>
  );
}