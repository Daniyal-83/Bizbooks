import React from "react";
import "../styles/Gallery.css";

export default function GallerySection() {
  const items = [
    { title: "Project Alpha", desc: "Invoice automation", img: require("../assets/hero.png") },
    { title: "Project Beta", desc: "Customer portal", img: require("../assets/logo.png") },
    { title: "Project Gamma", desc: "Payment analytics", img: require("../assets/hero.png") },
    { title: "Project Delta", desc: "Tax compliance", img: require("../assets/logo.png") },
  ];

  return (
    <section className="gallery">
      <h2 className="section-title">Our Projects</h2>
      <div className="gallery-grid">
        {items.map((x, i) => (
          <div key={i} className="gallery-card">
            <div className="gallery-thumb">
              <img src={x.img} alt={x.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
            </div>
            <div className="gallery-meta">
              <div className="gallery-title">{x.title}</div>
              <div className="gallery-desc">{x.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


