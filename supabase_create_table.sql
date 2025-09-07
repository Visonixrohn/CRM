CREATE TABLE comisiones (
  id SERIAL PRIMARY KEY,
  meta NUMERIC NOT NULL,
  comision_obtenida NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
