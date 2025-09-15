import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function SareeCatalog() {
  const API_BASE = "https://saree-backend-j7zj.onrender.com";
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubfolder, setActiveSubfolder] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxItems, setLightboxItems] = useState([]);
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

  function openLightbox(items, index) {
    setLightboxItems(items);
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
    setLightboxItems([]);
  }

  function prevImage() {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxItems.length - 1));
  }

  function nextImage() {
    setLightboxIndex((prev) => (prev < lightboxItems.length - 1 ? prev + 1 : 0));
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 to-indigo-900 flex items-center justify-center">
        <p className="text-white text-2xl font-bold animate-pulse">Loading catalog…</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-900 to-indigo-900 flex items-center justify-center">
        <p className="text-red-400 text-xl font-semibold">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col relative text-gray-100">
      
      {/* Beautiful animated background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-fuchsia-900 via-purple-900 to-indigo-900 overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, -50, 0], y: [0, -30, 30, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl top-20 left-10"
        />
        <motion.div
          animate={{ x: [0, -60, 60, 0], y: [0, 40, -40, 0] }}
          transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl bottom-10 right-10"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/70 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
            Saree Studio
          </h1>
          <nav className="space-x-6 text-gray-300 font-medium hidden md:block">
            <a href="#catalog" className="hover:text-pink-400 transition">Catalog</a>
            <a href="#contact" className="hover:text-pink-400 transition">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-28 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
        >
          Discover Your Perfect Saree
        </motion.h2>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
          Exquisite handpicked sarees, crafted to make every occasion unforgettable.
        </p>
        <motion.a
          href="#catalog"
          whileHover={{ scale: 1.05 }}
          className="mt-8 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition"
        >
          Explore Collection
        </motion.a>
      </section>

      {/* Catalog */}
      <main id="catalog" className="max-w-7xl mx-auto p-6 space-y-16">
        {catalog.map(category => (
          <section key={category.id}>
            <h2 className="text-3xl font-bold text-pink-400 mb-6 border-b border-gray-800 pb-2">
              {category.name}
            </h2>
            {category.subfolders.map(sub => {
              const isActive = activeSubfolder === sub.id;
              const images = isActive ? sub.all : sub.preview;
              return (
                <div key={sub.id} className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{sub.name}</h3>
                    {(sub.all.length > 5 || isActive) && (
                      <button
                        onClick={() => toggleSubfolder(sub.id)}
                        className="text-sm text-pink-400 hover:underline"
                      >
                        {isActive ? "Show Less ↑" : "See All →"}
                      </button>
                    )}
                  </div>
                  <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {images.map((item, index) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => openLightbox(images, index)}
                        className="cursor-pointer bg-gray-800/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-700"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-56 object-cover"
                          draggable="false"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </section>
        ))}
      </main>

      {/* Lightbox with arrows + close */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev arrow */}
              <button
                onClick={prevImage}
                className="absolute left-2 md:left-6 bg-black/50 p-3 rounded-full text-white hover:bg-black/80"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Image */}
              <img
                src={lightboxItems[lightboxIndex]?.image}
                alt={lightboxItems[lightboxIndex]?.name}
                className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Next arrow */}
              <button
                onClick={nextImage}
                className="absolute right-2 md:right-6 bg-black/50 p-3 rounded-full text-white hover:bg-black/80"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer id="contact" className="bg-gray-950 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p>© 2025 Saree Studio. All Rights Reserved.</p>
          <div className="space-x-6 mt-3 md:mt-0">
            <a href="mailto:info@sareestudio.com" className="hover:text-pink-400">Email</a>
            <a href="tel:+911234567890" className="hover:text-pink-400">Call</a>
            <a href="https://instagram.com" target="_blank" className="hover:text-pink-400">Instagram</a>
            <a href="https://facebook.com" target="_blank" className="hover:text-pink-400">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
