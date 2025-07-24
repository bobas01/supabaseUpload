// src/App.js
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

// Icones simples via emojis, tu peux remplacer par des vrais SVG/Icon Libraries (ex: react-icons)
const EditIcon = () => <span style={{ cursor: "pointer", color: "#1976d2" }}>✏️</span>;
const DeleteIcon = () => <span style={{ cursor: "pointer", color: "red" }}>🗑️</span>;

// Initialise Supabase (remplace par tes valeurs d'env)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function AuthView() {
  // Formulaire Inscription / Connexion (email+mdp)
  return (
    <div style={{ maxWidth: 420, margin: "50px auto" }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        localization={{ variables: { sign_in: { email_input_placeholder: "Ton email" } } }}
        providers={[]} // pas de login social ici (email uniquement)
      />
    </div>
  );
}

function Gallery({ user }) {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchImages() {
    let { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setImages(data);
  }

  // Upload image (nouveau)
  async function uploadImage(e) {
    e.preventDefault();
    if (!file) return alert("Choisis une image!");
    setLoadingUpload(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload dans le bucket 'user-images'
    let { error: uploadError } = await supabase.storage.from("user-images").upload(filePath, file);
    if (uploadError) {
      alert("Erreur d'upload : " + uploadError.message);
      setLoadingUpload(false);
      return;
    }

    // Obtenir URL publique
    const { data: { publicUrl } } = supabase.storage.from("user-images").getPublicUrl(filePath);

    // Insérer en base
    const { error: dbError } = await supabase
      .from("images")
      .insert([{ user_id: user.id, url: publicUrl }]);
    if (dbError) alert("Erreur base : " + dbError.message);

    setFile(null);
    setLoadingUpload(false);
    fetchImages();
  }

  // Supprimer une image
  async function deleteImage(image) {
    if (!window.confirm("Supprimer cette image ?")) return;

    // Extraire le chemin dans storage (après user-images/)
    const pathInBucket = image.url.split("/user-images/")[1];
    if (!pathInBucket) {
      alert("URL invalide");
      return;
    }

    await supabase.storage.from("user-images").remove([`${user.id}/${pathInBucket}`]);
    await supabase.from("images").delete().eq("id", image.id);
    fetchImages();
  }

  // Commencer la modification
  function startEdit(image) {
    setEditingId(image.id);
  }

  // Modifier une image (upload nouveau fichier, mise à jour url)
  async function submitEdit(e) {
    e.preventDefault();
    if (!editingFile) {
      alert("Choisis une nouvelle image !");
      return;
    }
    setLoadingEdit(true);
    const fileExt = editingFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload fichier modifié
    let { error: uploadError } = await supabase.storage.from("user-images").upload(filePath, editingFile);
    if (uploadError) {
      alert("Erreur upload : " + uploadError.message);
      setLoadingEdit(false);
      return;
    }

    // Supprimer l'ancienne image dans storage
    const oldPath = images.find(img => img.id === editingId)?.url.split("/user-images/")[1];
    if (oldPath) {
      await supabase.storage.from("user-images").remove([`${user.id}/${oldPath}`]);
    }

    // Nouvelle URL
    const { data: { publicUrl } } = supabase.storage.from("user-images").getPublicUrl(filePath);

    // Mise à jour DB
    const { error: dbError } = await supabase.from("images").update({ url: publicUrl }).eq("id", editingId);
    if (dbError) alert("Erreur mise à jour : " + dbError.message);

    setEditingId(null);
    setEditingFile(null);
    setLoadingEdit(false);
    fetchImages();
  }

  // Annuler la modification
  function cancelEdit() {
    setEditingId(null);
    setEditingFile(null);
  }

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 24 }}>
      <h2>Galerie personnelle</h2>

      {/* Upload image */}
      <form onSubmit={uploadImage} style={{ marginBottom: 30 }}>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
        <button type="submit" disabled={loadingUpload} style={{ marginLeft: 8 }}>
          {loadingUpload ? "Upload en cours..." : "Ajouter une image"}
        </button>
      </form>

      {/* Grille des images */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 16,
        }}
      >
        {images.map((image) =>
          editingId === image.id ? (
            <form key={image.id} onSubmit={submitEdit} style={{ border: "1px solid #ccc", padding: 8, borderRadius: 8 }}>
              <img
                src={image.url}
                alt="preview"
                style={{ width: "100%", height: 120, objectFit: "cover", marginBottom: 8, borderRadius: 4 }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={e => setEditingFile(e.target.files[0])}
                required
              />
              <div style={{ marginTop: 8 }}>
                <button type="submit" disabled={loadingEdit}>
                  {loadingEdit ? "Mise à jour..." : "Valider la modification"}
                </button>
                <button type="button" onClick={cancelEdit} style={{ marginLeft: 6 }}>
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div
              key={image.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 8,
                position: "relative",
                textAlign: "center",
              }}
            >
              <img
                src={image.url}
                alt=""
                style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 4 }}
              />
              {/* Boutons modifier / supprimer */}
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <button 
                  title="Modifier"
                  onClick={() => startEdit(image)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  aria-label="Modifier image"
                >
                  <EditIcon />
                </button>
                <button
                  title="Supprimer"
                  onClick={() => deleteImage(image)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  aria-label="Supprimer image"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Bouton déconnexion */}
      <div style={{ marginTop: 30 }}>
        <button onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return session && session.user ? <Gallery user={session.user} /> : <AuthView />;
}
