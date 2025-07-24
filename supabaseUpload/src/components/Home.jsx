import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{textAlign: "center", marginTop: "100px"}}>
      <h1>Bienvenue sur la galerie Supabase</h1>
      <button onClick={() => navigate("/login")} style={{margin: "10px", padding: "10px 20px"}}>Connexion</button>
      <button onClick={() => navigate("/signup")} style={{margin: "10px", padding: "10px 20px"}}>Inscription</button>
    </div>
  );
} 