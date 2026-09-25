import { notFound } from 'next/navigation';

// Cualquier ruta desconocida bajo /en o /nb muestra el 404 traducido dentro del layout.
export default function CatchAll() {
    notFound();
}
