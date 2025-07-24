import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import UploadForm from "./UploadForm";
import ImageCard from "./ImageCard";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate("/login");
      else {
        setUser(data.user);
        fetchImages(data.user.id);
      }
    });
    // eslint-disable-next-line
  }, []);

  const fetchImages = async (userId) => {
    let { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error) setImages(data);
  };

  const handleDelete = async (id, url) => {
    // Supprimer du storage
    const path = url.split("/user-image/")[1];
    await supabase.storage.from("user-image").remove([path]);
    // Supprimer de la table
    await supabase.from("images").delete().eq("id", id);
    setImages(images.filter(img => img.id !== id));
  };

  return (
    <div>
      <h2>Ma galerie</h2>
      <UploadForm user={user} onUpload={() => fetchImages(user.id)} />
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:"10px"}}>
        {images.map(img => (
          <ImageCard key={img.id} img={img} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
