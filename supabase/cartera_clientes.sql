-- Tabla para cartera de clientes (crédito y contado)
CREATE TABLE IF NOT EXISTS cartera_clientes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo_cliente TEXT NOT NULL,
    celular TEXT NOT NULL,
    fecha_compra DATE NOT NULL,
    tipo TEXT NOT NULL -- 'Crédito' o 'Contado'
);
CREATE INDEX IF NOT EXISTS idx_cartera_tipo ON cartera_clientes(tipo);
