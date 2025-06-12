import { Link } from 'react-router-dom'

export default function Profile() {
  const profiles = [1, 2, 3, 4, 5]

  return (
    <div>
      {profiles.map(p => (
        <Link key={p} to={`/profiles/${p}`}>
          Profile {p}
          </Link>
      ))}
    </div>
  );
}
