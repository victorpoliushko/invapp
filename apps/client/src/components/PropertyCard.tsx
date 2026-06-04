import { useState } from "react";

type PropertyCardProps = {
  images: string[];
  address: string;
  type: string;
  price: string;
  bedrooms: number;
  area: string;
  description: string;
};

export function PropertyCard({ images, address, type, price, bedrooms, area, description }: PropertyCardProps) {
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="property-card">
      <div className="property-card-images">
        <img src={images[idx]} alt={address} />
        {images.length > 1 && (
          <>
            <button className="property-card-arrow property-card-arrow-left" onClick={prev}>‹</button>
            <button className="property-card-arrow property-card-arrow-right" onClick={next}>›</button>
            <div className="property-card-dots">
              {images.map((_, i) => (
                <span key={i} className={`property-card-dot${i === idx ? " active" : ""}`} onClick={() => setIdx(i)} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="property-card-body">
        <div className="property-card-header">
          <span className="property-card-type">{type}</span>
          <span className="property-card-price">{price}</span>
        </div>
        <p className="property-card-address">{address}</p>
        <p className="property-card-meta">{bedrooms} bed · {area}</p>
        <p className="property-card-description">{description}</p>
      </div>
    </div>
  );
}
