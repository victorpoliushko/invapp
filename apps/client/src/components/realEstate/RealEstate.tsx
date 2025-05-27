import "./RealEstate.css";

export default function RealEstate({ title, imageSrc, info, price }: {
  title: string;
  imageSrc?: string;
  info: string;
  price: string;
}) {
  const genericHouse = "../../assets/house-placeholder.jpg";
  return (
    <article className="real-estate-card">
      <img src={imageSrc ?? genericHouse} alt="house" />
      <h3>{title}</h3>
      <div className="info-group">
        <p>{info}</p>
        <p>{price}</p>
      </div>
    </article>
  );
}
