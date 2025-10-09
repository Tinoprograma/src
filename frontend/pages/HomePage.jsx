import { Link } from 'react-router-dom';
import { Music2, MessageSquare, Users, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Cinta superior suave en degradé (estática) */}
      <div className="h-1 w-full bg-gradient-to-r from-fuchsia-400 via-emerald-300 to-sky-400" />

      {/* Hero Section (claro) */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            <span>Descubrí el significado</span>
            <span className="block bg-gradient-to-r from-fuchsia-500 via-emerald-400 to-sky-500 bg-clip-text text-transparent">
              detrás de la música
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-600">
            Una plataforma comunitaria para explorar y compartir el contexto cultural de tus canciones favoritas en español.
          </p>

          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Link to="/songs">
              <Button
                size="lg"
                className="rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-sm"
              >
                Explorar Canciones
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl border-gray-300 text-gray-800 hover:bg-gray-100"
              >
                Unirse a la Comunidad
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section (tarjetas claras) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">
            ¿Cómo funciona <span className="bg-gradient-to-r from-fuchsia-500 via-emerald-400 to-sky-500 bg-clip-text text-transparent">SABELO</span>?
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-50 border border-fuchsia-200">
                <Music2 className="text-fuchsia-500" size={28} />
              </div>
              <h3 className="text-xl font-semibold">Explora Canciones</h3>
              <p className="mt-2 text-gray-600">
                Buscá tus canciones favoritas en nuestra creciente biblioteca.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 border border-sky-200">
                <MessageSquare className="text-sky-500" size={28} />
              </div>
              <h3 className="text-xl font-semibold">Leé Anotaciones</h3>
              <p className="mt-2 text-gray-600">
                Descubrí referencias culturales y significados ocultos.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200">
                <Users className="text-emerald-500" size={28} />
              </div>
              <h3 className="text-xl font-semibold">Contribuí</h3>
              <p className="mt-2 text-gray-600">
                Sumá tus propias anotaciones y conocimiento.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 border border-violet-200">
                <TrendingUp className="text-violet-500" size={28} />
              </div>
              <h3 className="text-xl font-semibold">Ganá Reputación</h3>
              <p className="mt-2 text-gray-600">
                Recibí votos positivos y construí tu perfil en la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (claro con borde suave) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-3xl font-bold">¿Listo para comenzar?</h2>
            <p className="mt-2 text-lg text-gray-600">
              Unite y ayudá a otros a entender la música.
            </p>
            <div className="mt-6">
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-sm"
                >
                  Crear Cuenta Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* keyframes vacíos por si los tenías antes; ya NO hay texto en movimiento */}
      <style>{`
        @keyframes marquee { }
      `}</style>
    </div>
  );
}
