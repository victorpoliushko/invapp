import "./RealEstateAsset.css";
import genericHouse from "../../../assets/house-placeholder.jpg"

interface IRealEstate {
  title: string;
  imageSrc?: string;
  info: string;
  price: string;
}

export default function RealEstateAsset({ props }: { props: IRealEstate }) {
  const { title, imageSrc, info, price } = props;

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
