ALTER TABLE ordenes_servicio
  ADD COLUMN telefono TEXT;
CREATE TABLE comisiones (
  id SERIAL PRIMARY KEY,
  meta NUMERIC NOT NULL,
  comision_obtenida NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE ordenes_servicio
  DROP COLUMN IF EXISTS estado,
  ADD COLUMN modelo TEXT,
  ADD COLUMN marca TEXT,
  ADD COLUMN falla TEXT,
  ADD COLUMN status TEXT;
