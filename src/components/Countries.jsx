import React, { useState, useEffect } from 'react'
import supabase from '../supabase/supabase.config'

export function Countries() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    getCountries();
  }, []);

  async function getCountries() {
    const { data } = await supabase.from("countries").select();
    setCountries(data);
  }

  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <img src="logo192.png" alt="Logo" width="30" height="30" className="d-inline-block align-top" />
          Junglex
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
    <div className="container mt-4">
        <h2>Lista de paises</h2>
        <ul className="list-group">
          {countries.map((country) => (
            <li key={country.id} className="list-group-item">
              {country.name}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}