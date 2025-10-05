-- Tabla para gastos mensuales por usuario
CREATE TABLE IF NOT EXISTS gastos_mensuales (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_gasto TEXT NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);
-- Index para búsquedas rápidas por usuario
CREATE INDEX IF NOT EXISTS idx_gastos_usuario ON gastos_mensuales(usuario_id);