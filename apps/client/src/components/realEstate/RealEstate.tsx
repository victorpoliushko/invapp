export default function RealEstate(props: {
  title: string;
  imageSrc: string;
  info: string;
  price: string;
}) {
  return (
    <div className="real-estate">
      <article className="real-estate-card">
        <img src="{props.imageSrc}" alt="house one" />
        <h3>{props.title}</h3>
        <div className="info-group">
          <p>{props.info}</p>
          <p>{props.price}</p>
        </div>
      </article>
      <article className="real-estate-card">
        <img src="../../assets/house2.jpeg" alt="house one" />
        <h3>Two bedroom flat, Kyiv, Bobik str.</h3>
        <div className="info-group">
          <p>Used house with some stuff</p>
          <p>$95000</p>
        </div>
        <div className="info-group">
          <p>Used house with some stuff</p>
          <p>$95000</p>
        </div>
      </article>
      <article className="real-estate-card">
        <img src="../../assets/house3.jpeg" alt="house one" />
        <h3>Three bedroom flat, Rivne, Boobik str.</h3>
        <div className="info-group">
          <p>New house with some stuff</p>
          <p>$235000</p>
        </div>
      </article>
      <article className="real-estate-card">
        <img src="../../assets/house3.jpeg" alt="house one" />
        <h3>No bedroom house, Odesa, Valik str.</h3>
        <div className="info-group">
          <p>No stuff, just walls</p>
          <p>$15000</p>
        </div>
      </article>
    </div>
  );
}
