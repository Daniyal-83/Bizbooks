import React from "react";
import "../styles/Gallery.css";

export default function GallerySection() {
  const items = [
    { title: "Project Alpha", desc: "Invoice automation" },
    { title: "Project Beta", desc: "Customer portal" },
    { title: "Project Gamma", desc: "Payment analytics" },
    { title: "Project Delta", desc: "Tax compliance" },
  ];

  return (
    <section className="gallery">
      <h2 className="section-title">Our Projects</h2>
      <div className="gallery-grid">
        {items.map((x, i) => (
          <div key={i} className="gallery-card">
            <div className="gallery-thumb" />
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


