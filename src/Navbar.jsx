import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { createStitches } from '@stitches/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { indigo, slate, blue } from '@radix-ui/colors';
import { FaBars, FaUserCircle } from 'react-icons/fa';

const { styled } = createStitches({
  theme: {
    colors: {
      primary: indigo.indigo9,
      primaryLight: indigo.indigo6,
      bg: slate.slate1,
      text: slate.slate12,
      accent: blue.blue9,
    },
    fonts: {
      body: 'Inter, system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial',
    },
  },
});

const Nav = styled('header', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '0 16px',
  height: 64,
  background: '$bg',
  borderBottom: '1px solid $primaryLight',
  color: '$text',
  boxSizing: 'border-box',
});

const Brand = styled(Link, {
  fontWeight: 700,
  color: '$primary',
  textDecoration: 'none',
  fontSize: '1.05rem',
});

const Items = styled('nav', {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
});

const Item = styled(Link, {
  padding: '8px 10px',
  borderRadius: 8,
  color: '$text',
  textDecoration: 'none',
  '&:hover': {
    background: '$primaryLight',
    color: '$primary',
  },
});

const Spacer = styled('div', { flex: 1 });

const UserButton = styled('button', {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: '$text',
});

const LogoutButton = styled('button', {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid $primaryLight',
  background: 'white',
  color: '$text',
  cursor: 'pointer',
  fontSize: '0.95rem',
  '&:hover': {
    background: '$primaryLight',
    color: '$primary',
  },
});

const MobileMenu = styled('div', {
  display: 'none',
  '@media (max-width: 768px)': {
    display: 'block',
  },
});

const DesktopOnly = styled('div', {
  '@media (max-width: 768px)': { display: 'none' },
});

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <Nav>
      <Brand to="/">CRM</Brand>
      <DesktopOnly>
        <Items>
          <Item to="/">Comisiones</Item>
          <Item to="/mis-gastos">Mis Gastos</Item>
          <Item to="/entregas">Entregas</Item>
          <Item to="/ordenes">Órdenes</Item>
          <Item to="/calculadoras">Calculadora</Item>
          <Item to="/razones">Razones</Item>
          <Item to="/tiendas">Tiendas</Item>
          <Item to="/documentos">Documentos</Item>
          <Item to="/clientes-nuevos">Clientes</Item>
          <Item to="/cotizaciones">Cotizaciones</Item>
          <Item to="/actualizaciones">Actualizaciones</Item>
          <Item to="/promedios">Promedios</Item>
          <Item to="/gestion">Gestión</Item>
          <Item to="/seguimiento">Seguimiento</Item>
          <Item to="/configuraciones">Configuraciones</Item>
          <Item to="/aprendisaje">Cartera</Item>
          {user && user.rol === 'superadmin' && <Item to="/admin">Admin</Item>}
        </Items>
      </DesktopOnly>
      <Spacer />

      <MobileMenu>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger aria-label="abrir menú" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <FaBars />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content sideOffset={8} align="end" style={{ padding: 8, borderRadius: 8, background: 'white', boxShadow: '0 6px 24px rgba(0,0,0,0.12)' }}>
            <DropdownMenu.Item asChild>
              <Link to="/">Comisiones</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/mis-gastos">Mis Gastos</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/entregas">Entregas</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/ordenes">Órdenes</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/calculadoras">Calculadora</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/razones">Razones</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/tiendas">Tiendas</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/documentos">Documentos</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/clientes-nuevos">Clientes</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/cotizaciones">Cotizaciones</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/actualizaciones">Actualizaciones</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/promedios">Promedios</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/gestion">Gestión</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/seguimiento">Seguimiento</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/configuraciones">Configuraciones</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/aprendisaje">Cartera</Link>
            </DropdownMenu.Item>
            {user && user.rol === 'superadmin' && (
              <DropdownMenu.Item asChild>
                <Link to="/admin">Admin</Link>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </MobileMenu>

      <UserButton onClick={() => {}} aria-label="usuario">
        <FaUserCircle size={20} />
        <span style={{ display: 'none' }}>{user?.nombre}</span>
      </UserButton>
      <div style={{ marginLeft: 8 }}>
        <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
      </div>
    </Nav>
  );
}
