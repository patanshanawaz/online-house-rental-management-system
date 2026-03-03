import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function App() {
  const [meta, setMeta] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: "",
    area: "",
    audience: "",
    maxRent: "",
    maxDistanceKm: ""
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "") {
        params.set(key, value);
      }
    });

    return params.toString();
  }, [filters]);

  useEffect(() => {
    async function fetchMeta() {
      const response = await fetch(`${API_BASE}/api/meta`);
      const data = await response.json();
      setMeta(data);
    }

    fetchMeta().catch(() => {
      setMeta(null);
    });
  }, []);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const endpoint = queryString
        ? `${API_BASE}/api/listings?${queryString}`
        : `${API_BASE}/api/listings`;
      const response = await fetch(endpoint);
      const data = await response.json();
      setListings(data.listings || []);
      setLoading(false);
    }

    fetchListings().catch(() => {
      setListings([]);
      setLoading(false);
    });
  }, [queryString]);

  function updateFilter(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <main className="page">
      <section className="hero">
        <h1>Nearby Accommodation Finder</h1>
        <p>
          Dedicated for students and university members of B.E.S.T Innovation
          University (Gownivaripalli, Gorantla) in supported nearby regions.
        </p>
      </section>

      <section className="panel">
        <h2>Search Filters</h2>
        <div className="grid">
          <label>
            Search
            <input
              value={filters.q}
              onChange={(event) => updateFilter("q", event.target.value)}
              placeholder="room, hostel, 1BHK..."
            />
          </label>

          <label>
            Area
            <select
              value={filters.area}
              onChange={(event) => updateFilter("area", event.target.value)}
            >
              <option value="">All service areas</option>
              <option value="gorantla">Gorantla</option>
              <option value="gownivaripalli">Gownivaripalli</option>
              <option value="bagepalli">Bagepalli</option>
            </select>
          </label>

          <label>
            Audience
            <select
              value={filters.audience}
              onChange={(event) =>
                updateFilter("audience", event.target.value)
              }
            >
              <option value="">All</option>
              <option value="students">Students</option>
              <option value="university staff">University Staff</option>
              <option value="families">Families</option>
            </select>
          </label>

          <label>
            Max Rent (INR)
            <input
              type="number"
              min="0"
              value={filters.maxRent}
              onChange={(event) =>
                updateFilter("maxRent", event.target.value)
              }
              placeholder="e.g. 8000"
            />
          </label>

          <label>
            Max Distance to Campus (KM)
            <input
              type="number"
              min="0"
              value={filters.maxDistanceKm}
              onChange={(event) =>
                updateFilter("maxDistanceKm", event.target.value)
              }
              placeholder="e.g. 20"
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Service Coverage</h2>
        {meta ? (
          <>
            <p>
              <strong>University:</strong> {meta.university.fullName}
            </p>
            <ul>
              {meta.serviceArea.map((locality) => (
                <li key={locality.key}>{locality.label}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>Unable to load service area metadata.</p>
        )}
      </section>

      <section className="panel">
        <h2>Available Listings</h2>
        {loading ? (
          <p>Loading listings...</p>
        ) : listings.length === 0 ? (
          <p>No listings match your filters in the active service area.</p>
        ) : (
          <div className="cards">
            {listings.map((item) => (
              <article key={item.id} className="card">
                <h3>{item.title}</h3>
                <p>
                  <strong>Type:</strong> {item.type}
                </p>
                <p>
                  <strong>Area:</strong> {item.area}, {item.district}, {item.state}
                </p>
                <p>
                  <strong>Rent:</strong> ₹{item.rentInr}/month
                </p>
                <p>
                  <strong>Distance:</strong> {item.distanceToCampusKm} km from
                  campus
                </p>
                <p>
                  <strong>Suitable for:</strong> {item.suitableFor.join(", ")}
                </p>
                <p>
                  <strong>Amenities:</strong> {item.amenities.join(", ")}
                </p>
                <p>
                  <strong>Contact:</strong> {item.contact}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
