import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import logo from "./logo.png"; // your company logo

export default function SareeCatalog() {
  // const API_BASE = "http://localhost:5000";
  const API_BASE = "https://saree-backend-j7zj.onrender.com";
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubfolder, setActiveSubfolder] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [error, setError] = useState(null);

  async function tryFetchJson(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function normalizeFileObj(f) {
    if (!f) return null;
    const id = f.id || f.fileId || f.name;
    const name =
      f.name ||
      f.title ||
      (f.fileName?.split(".").slice(0, -1).join(".")) ||
      id;
    const image = f.image || (id ? `https://drive.google.com/uc?id=${id}` : null);
    return { id, name, image };
  }

  function normalizeFilesArray(arr = []) {
    return arr
      .map(normalizeFileObj)
      .filter(Boolean)
      .filter((v, i, a) => v.id && a.findIndex(x => x.id === v.id) === i);
  }

  async function loadCatalog() {
    setLoading(true);
    setError(null);

    const data = await tryFetchJson(`${API_BASE}/api/catalog`);
    if (!Array.isArray(data)) {
      setError("Cannot fetch catalog");
      setLoading(false);
      return;
    }

    const normalized = data.map(cat => ({
      id: cat.id,
      name: cat.name,
      subfolders: (cat.subfolders || []).map(sub => {
        const preview = normalizeFilesArray(sub.preview || sub.files || []).slice(0, 5);
        const all = normalizeFilesArray(sub.all || sub.files || []);
        return { id: sub.id, name: sub.name, preview, all: all.length ? all : preview };
      }),
    }));

    setCatalog(normalized);
    setLoading(false);
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  function toggleSubfolder(subId) {
    setActiveSubfolder(prev => (prev === subId ? null : subId));
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 to-purple-900 flex items-center justify-center">
        <p className="text-white text-2xl font-bold animate-pulse">Loading catalog…</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 to-purple-900 flex items-center justify-center">
        <p className="text-red-400 text-xl font-semibold">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <img  alt="Company Logo" className="w-12 h-12 object-contain"/>
            <h1 className="text-3xl font-extrabold text-pink-400 tracking-wide">Saree Studio</h1>
          </div>
          <nav className="space-x-6 text-gray-300 font-medium">
            <a href="#catalog" className="hover:text-pink-400 transition">Catalog</a>
            <a href="#contact" className="hover:text-pink-400 transition">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center text-center py-32 px-4">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Discover Your Perfect Saree</h2>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
          Explore our exquisite collection of handpicked sarees for every occasion.
        </p>
        <a
          href="#catalog"
          className="px-8 py-4 bg-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl hover:bg-pink-600 transition"
        >
          Explore Catalog
        </a>
        <div className="absolute inset-0 overflow-hidden -z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 100, ease: "linear" }}
            className="absolute w-96 h-96 bg-pink-700 rounded-full opacity-30 top-20 left-10 blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 150, ease: "linear" }}
            className="absolute w-72 h-72 bg-purple-700 rounded-full opacity-25 bottom-10 right-20 blur-3xl"
          />
        </div>
      </section>

      {/* Catalog */}
      <main id="catalog" className="max-w-7xl mx-auto p-6 space-y-16">
        {catalog.map(category => (
          <section key={category.id}>
            <h2 className="text-3xl font-bold text-pink-400 mb-6 border-b border-gray-700 pb-2">
              {category.name}
            </h2>

            {category.subfolders.map(sub => {
              const isActive = activeSubfolder === sub.id;
              const images = isActive ? sub.all : sub.preview;

              return (
                <div key={sub.id} className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold">{sub.name}</h3>
                    {(sub.all.length > 5 || isActive) && (
                      <button
                        onClick={() => toggleSubfolder(sub.id)}
                        className={`text-sm ${
                          isActive ? "text-gray-400" : "text-pink-400"
                        } hover:underline`}
                      >
                        {isActive ? "Show Less ↑" : "See All →"}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
                    >
                      {images.map(item => (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.05, rotate: 1 }}
                          onClick={() => setLightbox(item)}
                          className="cursor-pointer bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 transition transform hover:-translate-y-1"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-56 object-cover select-none"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                          />
                          <div className="p-3 bg-gray-900/70 backdrop-blur-sm">
                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            })}
          </section>
        ))}
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox.image}
              alt={lightbox.name}
              className="max-h-[90vh] rounded-xl select-none shadow-2xl"
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p>© 2025 Saree Studio. All Rights Reserved.</p>
          <div className="space-x-6 mt-2 md:mt-0">
            <a href="mailto:info@sareestudio.com" className="hover:text-pink-400">info@sareestudio.com</a>
            <a href="tel:+911234567890" className="hover:text-pink-400">+91 1234567890</a>
            <a href="https://instagram.com" target="_blank" className="hover:text-pink-400">Instagram</a>
            <a href="https://facebook.com" target="_blank" className="hover:text-pink-400">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
