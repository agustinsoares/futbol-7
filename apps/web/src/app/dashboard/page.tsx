'use client';
import React from 'react';

export default function Home() {
    return (
        <div className="min-h-screen bg-neutral text-secondary">
            {/* Navbar */}
            <nav className="bg-secondary text-neutral p-4 flex justify-between items-center">
                <div className="flex space-x-4">
                    <a href="#" className="hover:text-accent2">Matches</a>
                    <a href="#" className="hover:text-accent2">Live Score</a>
                    <a href="#" className="hover:text-accent2">Statistics</a>
                    <a href="#" className="hover:text-accent2">Analytics</a>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-primary font-bold">ALTO</span>
                    <span className="font-bold">FOOTBALL</span>
                    <div className="flex items-center space-x-2">
                        <img src="/images/profile.jpg" alt="Profile" className="w-8 h-8 rounded-full" />
                        <span>Leo Messi</span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-cover bg-center h-96" style={{ backgroundImage: "url('/images/hero.jpg')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl text-neutral font-bold mb-4">Organiza y juega tus torneos de fútbol fácilmente.</h1>
                        <p className="text-neutral text-lg mb-6">Crea ligas, registra equipos, consulta resultados y estadísticas sobre tu equipo</p>
                        <div className="space-x-4">
                            <button className="bg-primary text-neutral px-6 py-3 rounded hover:bg-accent1">Crear Equipo</button>
                            <button className="bg-neutral text-primary px-6 py-3 rounded hover:bg-accent2">Buscar Equipo</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <img src="/images/icons/up-arrow.png" alt="Up Arrow" className="mx-auto mb-4 w-12 h-12" />
                        <h3 className="text-xl font-semibold mb-2">Crea tus torneos fácilmente</h3>
                        <p className="text-gray-600">Define equipos, grupos y reglas.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <img src="/images/icons/up-arrow.png" alt="Up Arrow" className="mx-auto mb-4 w-12 h-12" />
                        <h3 className="text-xl font-semibold mb-2">Crea tus torneos fácilmente</h3>
                        <p className="text-gray-600">Define equipos, grupos y reglas.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <img src="/images/icons/up-arrow.png" alt="Up Arrow" className="mx-auto mb-4 w-12 h-12" />
                        <h3 className="text-xl font-semibold mb-2">Crea tus torneos fácilmente</h3>
                        <p className="text-gray-600">Define equipos, grupos y reglas.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <img src="/images/icons/up-arrow.png" alt="Up Arrow" className="mx-auto mb-4 w-12 h-12" />
                        <h3 className="text-xl font-semibold mb-2">Crea tus torneos fácilmente</h3>
                        <p className="text-gray-600">Define equipos, grupos y reglas.</p>
                    </div>
                </div>
            </section>

            {/* Example Tournament Section */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold mb-4">Mira cómo funcionan nuestros torneos</h2>
                        <p className="text-gray-600 mb-4">Más de 50 equipos ya conforman Alto Fútbol.</p>
                        <p className="text-gray-600 italic">"Organizar nuestra liga nunca fue tan fácil."</p>
                        <p className="text-gray-600">- Club Los Titanes</p>
                    </div>
                    <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Torneo de Ejemplo</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="pb-2">Posición</th>
                                    <th>P</th>
                                    <th>O</th>
                                    <th>W</th>
                                    <th>R</th>
                                    <th>E</th>
                                    <th>A</th>
                                    <th>PT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-2">1 Ejempa</td>
                                    <td>3</td>
                                    <td>3</td>
                                    <td>1</td>
                                    <td>0</td>
                                    <td>5</td>
                                    <td>0</td>
                                    <td>5</td>
                                </tr>
                                <tr>
                                    <td className="py-2">2 Ogenuss</td>
                                    <td>3</td>
                                    <td>0</td>
                                    <td>1</td>
                                    <td>5</td>
                                    <td>3</td>
                                    <td>0</td>
                                    <td>0</td>
                                </tr>
                                <tr>
                                    <td className="py-2">3 Calencias</td>
                                    <td>3</td>
                                    <td>0</td>
                                    <td>1</td>
                                    <td>7</td>
                                    <td>3</td>
                                    <td>5</td>
                                    <td>0</td>
                                </tr>
                                <tr>
                                    <td className="py-2">4 Pones</td>
                                    <td>3</td>
                                    <td>1</td>
                                    <td>0</td>
                                    <td>2</td>
                                    <td>2</td>
                                    <td>0</td>
                                    <td>4</td>
                                </tr>
                            </tbody>
                        </table>
                        <button className="mt-4 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">Empieza a organizar tu torneo hoy</button>
                    </div>
                </div>
            </section>
        </div>
    );
}