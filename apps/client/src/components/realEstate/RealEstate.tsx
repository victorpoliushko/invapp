import "./RealEstate.css";

export default function RealEstate(props: {
  title: string;
  imageSrc: string;
  info: string;
  price: string;
}) {
  return (
    <div className="real-estate">
      <article className="real-estate-card">
        <img src={props.imageSrc} alt="house one" />
        <h3>{props.title}</h3>
        <div className="info-group">
          <p>{props.info}</p>
          <p>{props.price}</p>
        </div>
      </article>
    </div>
  );
}
