import "./RealEstate.css";

export default function RealEstate({ title, imageSrc, info, price }: {
  title: string;
  imageSrc: string;
  info: string;
  price: string;
}) {
  return (
    <article className="real-estate-card">
      <img src={imageSrc} alt="house one" />
      <h3>{title}</h3>
      <div className="info-group">
        <p>{info}</p>
        <p>{price}</p>
      </div>
    </article>
  );
}
