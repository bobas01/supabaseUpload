import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function ImageCard({ img, onDelete }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    console.log("Chemin image :", img.url);
    async function getUrl() {
      const { data, error } = await supabase
        .storage
        .from("user-image")
        .createSignedUrl(img.url, 60 * 60);
      if (data) setUrl(data.signedUrl);
      if (error) console.error("Erreur createSignedUrl :", error);
    }
    getUrl();
  }, [img.url]);

  return (
    <div style={{border:"1px solid #ccc", padding:"5px", textAlign:"center"}}>
      <img src={url} alt="miniature" style={{width:"100%", maxHeight:"120px", objectFit:"cover"}} />
      {console.log("URL signée générée :", url)}
      <button onClick={() => onDelete(img.id, url)} style={{marginTop:"5px"}}>Supprimer</button>
    </div>
  );
}