import { Injectable, signal, computed } from '@angular/core';
import { Visitante, Sala, SolicitudVisita, EstadoSolicitud, PrioridadSolicitud, EstadisticasDashboard } from '../models/sgvti.models';

const STORAGE_KEY_VISITANTES = 'sgvti_visitantes';
const STORAGE_KEY_SOLICITUDES = 'sgvti_solicitudes';
const STORAGE_KEY_SALAS = 'sgvti_salas';
const STORAGE_KEY_CORRELATIVO = 'sgvti_correlativo_ticket';

@Injectable({
    providedIn: 'root'
})
export class SgvtiService {
    // Signals
    visitantes = signal<Visitante[]>([]);
    salas = signal<Sala[]>([]);
    solicitudes = signal<SolicitudVisita[]>([]);
    turnoActualLlamado = signal<SolicitudVisita | null>(null);

    // Computed signals
    solicitudesEnEspera = computed(() => this.solicitudes().filter(s => s.estado === 'En Espera'));
    solicitudesEnSala = computed(() => this.solicitudes().filter(s => s.estado === 'En Sala'));
    solicitudesFinalizadas = computed(() => this.solicitudes().filter(s => s.estado === 'Finalizado'));

    constructor() {
        this.inicializarDatos();
    }

    private inicializarDatos(): void {
        const rawSalas = localStorage.getItem(STORAGE_KEY_SALAS);
        const rawVisitantes = localStorage.getItem(STORAGE_KEY_VISITANTES);
        const rawSolicitudes = localStorage.getItem(STORAGE_KEY_SOLICITUDES);

        if (rawSalas && rawVisitantes && rawSolicitudes) {
            try {
                this.salas.set(JSON.parse(rawSalas));
                this.visitantes.set(JSON.parse(rawVisitantes));
                this.solicitudes.set(JSON.parse(rawSolicitudes));
                return;
            } catch (e) {
                console.error('Error cargando localStorage, restaurando datos demo', e);
            }
        }

        this.cargarDatosDemo();
    }

    cargarDatosDemo(): void {
        const salasDemo: Sala[] = [
            {
                id: 'sala-1',
                codigo: 'STI-01',
                nombre: 'Sala TI - Servidores & Infraestructura',
                piso: 'Piso 2 - Ala Norte',
                capacidad: 8,
                ocupados: 1,
                estado: 'Disponible',
                responsable: 'Ing. Carlos Mendoza (Gerente TI)',
                descripcion: 'Área segura para mantenimiento de servidores, redes y soporte técnico corporativo.'
            },
            {
                id: 'sala-2',
                codigo: 'SJA-02',
                nombre: 'Sala de Juntas Directiva',
                piso: 'Piso 3 - Presidencia',
                capacidad: 15,
                ocupados: 2,
                estado: 'Disponible',
                responsable: 'Lic. Mariana Gómez',
                descripcion: 'Equipada con videoconferencia de alta definición para reuniones ejecutivas y proveedores.'
            },
            {
                id: 'sala-3',
                codigo: 'RRHH-03',
                nombre: 'Recursos Humanos & Entrevistas',
                piso: 'Piso 1 - Recepción',
                capacidad: 6,
                ocupados: 0,
                estado: 'Disponible',
                responsable: 'Dra. Andrea Morales',
                descripcion: 'Espacio acondicionado para atención al personal, reclutamiento y firmas de convenios.'
            },
            {
                id: 'sala-4',
                codigo: 'AUD-04',
                nombre: 'Auditorio Principal',
                piso: 'Planta Baja',
                capacidad: 60,
                ocupados: 0,
                estado: 'Disponible',
                responsable: 'Coordinación General',
                descripcion: 'Espacio para conferencias, capacitaciones generales y presentaciones públicas.'
            },
            {
                id: 'sala-5',
                codigo: 'OFT-05',
                nombre: 'Oficina de Compras y Suministros',
                piso: 'Piso 1 - Ala Sur',
                capacidad: 5,
                ocupados: 1,
                estado: 'Disponible',
                responsable: 'Lic. Roberto Silva',
                descripcion: 'Recepción de proveedores, presupuestos, facturación y entrega de cotizaciones.'
            }
        ];

        const hoyStr = new Date().toISOString().split('T')[0];

        const visitantesDemo: Visitante[] = [
            {
                id: 'vis-1',
                tipoDocumento: 'Cédula',
                documento: '1098273645',
                nombres: 'Alejandro',
                apellidos: 'Ramírez Delgado',
                telefono: '+57 310 456 7890',
                email: 'alejandro.ramirez@cisco-support.com',
                empresa: 'Cisco Networking Systems',
                cargo: 'Especialista en Redes y Telecomunicaciones',
                fechaRegistro: `${hoyStr} 08:30`,
                totalVisitas: 5,
                estado: 'Activo',
                observaciones: 'Proveedor autorizado de soporte de red.'
            },
            {
                id: 'vis-2',
                tipoDocumento: 'Cédula',
                documento: '1023456789',
                nombres: 'Valentina',
                apellidos: 'Ríos Montiel',
                telefono: '+57 315 789 1234',
                email: 'valentina.rios@solutionsit.org',
                empresa: 'Solutions IT Consultores',
                cargo: 'Consultora de Ciberseguridad',
                fechaRegistro: `${hoyStr} 09:15`,
                totalVisitas: 2,
                estado: 'Activo',
                observaciones: 'Visita para auditoría de seguridad perimetral.'
            },
            {
                id: 'vis-3',
                tipoDocumento: 'DNI',
                documento: '45678912',
                nombres: 'Diego Fernando',
                apellidos: 'Castro Méndez',
                telefono: '+57 300 123 4567',
                email: 'diego.castro@dell.latam.com',
                empresa: 'Dell Technologies Latam',
                cargo: 'Ingeniero de Servicio Técnico',
                fechaRegistro: `${hoyStr} 09:40`,
                totalVisitas: 8,
                estado: 'Activo',
                observaciones: 'Mantenimiento preventivo anual de rack de almacenamiento.'
            },
            {
                id: 'vis-4',
                tipoDocumento: 'Cédula',
                documento: '52890123',
                nombres: 'Laura Marcela',
                apellidos: 'Gutiérrez Ospina',
                telefono: '+57 312 987 6543',
                email: 'laura.gutierrez@talentohumano.co',
                empresa: 'Aspirante / Particular',
                cargo: 'Candidata Desarrolladora Senior',
                fechaRegistro: `${hoyStr} 10:00`,
                totalVisitas: 1,
                estado: 'Activo',
                observaciones: 'Entrevista técnica programada con el departamento de TI.'
            },
            {
                id: 'vis-5',
                tipoDocumento: 'Pasaporte',
                documento: 'PA987654321',
                nombres: 'Michael John',
                apellidos: 'Smith',
                telefono: '+1 415 890 2341',
                email: 'm.smith@globalaudit.com',
                empresa: 'Global Audit International',
                cargo: 'Lead Auditor',
                fechaRegistro: `${hoyStr} 08:00`,
                totalVisitas: 3,
                estado: 'Activo',
                observaciones: 'Auditor externo ISO 27001.'
            }
        ];

        const solicitudesDemo: SolicitudVisita[] = [
            {
                id: 'sol-1',
                numeroTicket: 'TK-001',
                turnoNumero: 1,
                visitanteId: 'vis-1',
                visitante: visitantesDemo[0],
                salaId: 'sala-1',
                sala: salasDemo[0],
                motivo: 'Mantenimiento de Servidores / Infraestructura',
                motivoDetalle: 'Revisión y configuración del switch de fibra óptica en datacenter.',
                anfitrion: 'Ing. Carlos Mendoza (Gerente TI)',
                ingresaEquipo: true,
                detalleEquipo: 'Laptop HP EliteBook Serial #HP-998822, analizador de red Fluke',
                prioridad: 'Urgente',
                estado: 'En Sala',
                fechaHoraSolicitud: `${hoyStr} 08:45`,
                horaIngresoSala: '08:50',
                observaciones: 'Acceso autorizado al datacenter piso 2.'
            },
            {
                id: 'sol-2',
                numeroTicket: 'TK-002',
                turnoNumero: 2,
                visitanteId: 'vis-2',
                visitante: visitantesDemo[1],
                salaId: 'sala-2',
                sala: salasDemo[1],
                motivo: 'Reunión de Negocios',
                motivoDetalle: 'Presentación ejecutiva del plan de ciberseguridad 2026.',
                anfitrion: 'Lic. Mariana Gómez',
                ingresaEquipo: true,
                detalleEquipo: 'MacBook Pro 14" Serial #C02G10XYZ',
                prioridad: 'Normal',
                estado: 'En Sala',
                fechaHoraSolicitud: `${hoyStr} 09:20`,
                horaIngresoSala: '09:25',
                observaciones: 'Requiere proyector HDMI.'
            },
            {
                id: 'sol-3',
                numeroTicket: 'TK-003',
                turnoNumero: 3,
                visitanteId: 'vis-3',
                visitante: visitantesDemo[2],
                salaId: 'sala-1',
                sala: salasDemo[0],
                motivo: 'Soporte Técnico',
                motivoDetalle: 'Reemplazo de fuentes redundantes en servidor Dell PowerEdge R750.',
                anfitrion: 'Ing. Carlos Mendoza (Gerente TI)',
                ingresaEquipo: true,
                detalleEquipo: 'Kit de herramientas y 2 fuentes de poder Dell 1400W',
                prioridad: 'Normal',
                estado: 'En Espera',
                fechaHoraSolicitud: `${hoyStr} 10:15`,
                observaciones: 'Esperando pase de seguridad de datacenter.'
            },
            {
                id: 'sol-4',
                numeroTicket: 'TK-004',
                turnoNumero: 4,
                visitanteId: 'vis-4',
                visitante: visitantesDemo[3],
                salaId: 'sala-3',
                sala: salasDemo[2],
                motivo: 'Entrevista de Trabajo',
                motivoDetalle: 'Segunda etapa: entrevista técnica y prueba de arquitectura.',
                anfitrion: 'Dra. Andrea Morales (Recursos Humanos)',
                ingresaEquipo: false,
                prioridad: 'Preferencial',
                estado: 'En Espera',
                fechaHoraSolicitud: `${hoyStr} 10:30`,
                observaciones: 'Citada a las 10:30 a.m.'
            },
            {
                id: 'sol-5',
                numeroTicket: 'TK-000',
                turnoNumero: 0,
                visitanteId: 'vis-5',
                visitante: visitantesDemo[4],
                salaId: 'sala-2',
                sala: salasDemo[1],
                motivo: 'Auditoría',
                motivoDetalle: 'Apertura de auditoría interna de procesos.',
                anfitrion: 'Ing. Fernando Castro',
                ingresaEquipo: true,
                detalleEquipo: 'Laptop Lenovo ThinkPad Serial #TP-12908',
                prioridad: 'Normal',
                estado: 'Finalizado',
                fechaHoraSolicitud: `${hoyStr} 08:00`,
                horaIngresoSala: '08:05',
                horaSalida: '09:45',
                tiempoPermanencia: '1h 40m',
                observaciones: 'Reunión inicial concluida satisfactoriamente.'
            }
        ];

        this.salas.set(salasDemo);
        this.visitantes.set(visitantesDemo);
        this.solicitudes.set(solicitudesDemo);
        localStorage.setItem(STORAGE_KEY_CORRELATIVO, '5');
        this.guardarEnStorage();
    }

    private guardarEnStorage(): void {
        try {
            localStorage.setItem(STORAGE_KEY_SALAS, JSON.stringify(this.salas()));
            localStorage.setItem(STORAGE_KEY_VISITANTES, JSON.stringify(this.visitantes()));
            localStorage.setItem(STORAGE_KEY_SOLICITUDES, JSON.stringify(this.solicitudes()));
        } catch (e) {
            console.error('Error guardando en localStorage', e);
        }
    }

    // --- VISITANTES ---
    buscarVisitantePorDocumento(documento: string): Visitante | undefined {
        const docLimpio = documento.trim().toLowerCase();
        return this.visitantes().find(v => v.documento.trim().toLowerCase() === docLimpio);
    }

    buscarVisitantes(termino: string): Visitante[] {
        const term = termino.trim().toLowerCase();
        if (!term) return this.visitantes();
        return this.visitantes().filter(v => 
            v.documento.toLowerCase().includes(term) ||
            v.nombres.toLowerCase().includes(term) ||
            v.apellidos.toLowerCase().includes(term) ||
            v.empresa.toLowerCase().includes(term)
        );
    }

    crearVisitante(data: Omit<Visitante, 'id' | 'fechaRegistro' | 'totalVisitas'>): Visitante {
        const hoy = new Date();
        const fechaHora = hoy.toISOString().replace('T', ' ').substring(0, 16);
        const nuevoVisitante: Visitante = {
            ...data,
            id: 'vis-' + Date.now(),
            fechaRegistro: fechaHora,
            totalVisitas: 0,
            estado: 'Activo'
        };

        this.visitantes.update(list => [nuevoVisitante, ...list]);
        this.guardarEnStorage();
        return nuevoVisitante;
    }

    actualizarVisitante(visitanteActualizado: Visitante): void {
        this.visitantes.update(list => list.map(v => v.id === visitanteActualizado.id ? visitanteActualizado : v));
        // Actualizar datos denormalizados en solicitudes si corresponde
        this.solicitudes.update(list => list.map(s => {
            if (s.visitanteId === visitanteActualizado.id) {
                return { ...s, visitante: visitanteActualizado };
            }
            return s;
        }));
        this.guardarEnStorage();
    }

    // --- SALAS ---
    getSalas(): Sala[] {
        return this.salas();
    }

    getSalaPorId(id: string): Sala | undefined {
        return this.salas().find(s => s.id === id);
    }

    crearSala(sala: Omit<Sala, 'id' | 'ocupados'>): Sala {
        const nuevaSala: Sala = {
            ...sala,
            id: 'sala-' + Date.now(),
            ocupados: 0
        };
        this.salas.update(list => [...list, nuevaSala]);
        this.guardarEnStorage();
        return nuevaSala;
    }

    // --- SOLICITUDES & TICKETS ---
    crearSolicitud(params: {
        visitanteId: string;
        salaId: string;
        motivo: string;
        motivoDetalle?: string;
        anfitrion: string;
        ingresaEquipo: boolean;
        detalleEquipo?: string;
        prioridad: PrioridadSolicitud;
        observaciones?: string;
    }): SolicitudVisita {
        const visitante = this.visitantes().find(v => v.id === params.visitanteId);
        if (!visitante) {
            throw new Error('Visitante no encontrado');
        }

        const sala = this.salas().find(s => s.id === params.salaId);
        if (!sala) {
            throw new Error('Sala no encontrada');
        }

        // Generar correlativo de ticket: e.g. TK-005
        let correlativo = parseInt(localStorage.getItem(STORAGE_KEY_CORRELATIVO) || '5', 10);
        correlativo += 1;
        localStorage.setItem(STORAGE_KEY_CORRELATIVO, correlativo.toString());

        const padTurno = correlativo.toString().padStart(3, '0');
        const numeroTicket = `TK-${padTurno}`;

        const ahora = new Date();
        const fechaHoraStr = ahora.toISOString().replace('T', ' ').substring(0, 16);

        const nuevaSolicitud: SolicitudVisita = {
            id: 'sol-' + Date.now(),
            numeroTicket,
            turnoNumero: correlativo,
            visitanteId: visitante.id,
            visitante: { ...visitante },
            salaId: sala.id,
            sala: { ...sala },
            motivo: params.motivo,
            motivoDetalle: params.motivoDetalle,
            anfitrion: params.anfitrion,
            ingresaEquipo: params.ingresaEquipo,
            detalleEquipo: params.detalleEquipo,
            prioridad: params.prioridad,
            estado: 'En Espera',
            fechaHoraSolicitud: fechaHoraStr,
            observaciones: params.observaciones
        };

        // Incrementar total visitas del visitante
        this.visitantes.update(list => list.map(v => {
            if (v.id === visitante.id) {
                return { ...v, totalVisitas: (v.totalVisitas || 0) + 1 };
            }
            return v;
        }));

        this.solicitudes.update(list => [nuevaSolicitud, ...list]);
        this.guardarEnStorage();
        return nuevaSolicitud;
    }

    llamarTurno(id: string): SolicitudVisita | null {
        const solicitud = this.solicitudes().find(s => s.id === id);
        if (solicitud) {
            this.turnoActualLlamado.set(solicitud);
            return solicitud;
        }
        return null;
    }

    registrarIngresoSala(id: string): void {
        const ahora = new Date();
        const horaStr = ahora.toTimeString().substring(0, 5);

        this.solicitudes.update(list => list.map(s => {
            if (s.id === id) {
                // Actualizar ocupación en sala
                this.salas.update(salas => salas.map(sala => {
                    if (sala.id === s.salaId) {
                        return { ...sala, ocupados: sala.ocupados + 1 };
                    }
                    return sala;
                }));

                const actualizada: SolicitudVisita = {
                    ...s,
                    estado: 'En Sala',
                    horaIngresoSala: horaStr
                };
                if (this.turnoActualLlamado()?.id === id) {
                    this.turnoActualLlamado.set(actualizada);
                }
                return actualizada;
            }
            return s;
        }));

        this.guardarEnStorage();
    }

    registrarSalida(id: string): void {
        const ahora = new Date();
        const horaSalidaStr = ahora.toTimeString().substring(0, 5);

        this.solicitudes.update(list => list.map(s => {
            if (s.id === id) {
                // Decrementar ocupación en sala si estaba en sala
                if (s.estado === 'En Sala') {
                    this.salas.update(salas => salas.map(sala => {
                        if (sala.id === s.salaId) {
                            return { ...sala, ocupados: Math.max(0, sala.ocupados - 1) };
                        }
                        return sala;
                    }));
                }

                // Calcular permanencia aproximada
                let tiempo = '30m';
                if (s.horaIngresoSala) {
                    const [hIngreso, mIngreso] = s.horaIngresoSala.split(':').map(Number);
                    const [hSalida, mSalida] = horaSalidaStr.split(':').map(Number);
                    const diffMins = (hSalida * 60 + mSalida) - (hIngreso * 60 + mIngreso);
                    if (diffMins > 0) {
                        const h = Math.floor(diffMins / 60);
                        const m = diffMins % 60;
                        tiempo = h > 0 ? `${h}h ${m}m` : `${m}m`;
                    }
                }

                return {
                    ...s,
                    estado: 'Finalizado',
                    horaSalida: horaSalidaStr,
                    tiempoPermanencia: tiempo
                };
            }
            return s;
        }));

        if (this.turnoActualLlamado()?.id === id) {
            this.turnoActualLlamado.set(null);
        }

        this.guardarEnStorage();
    }

    cancelarSolicitud(id: string): void {
        this.solicitudes.update(list => list.map(s => {
            if (s.id === id) {
                if (s.estado === 'En Sala') {
                    this.salas.update(salas => salas.map(sala => {
                        if (sala.id === s.salaId) {
                            return { ...sala, ocupados: Math.max(0, sala.ocupados - 1) };
                        }
                        return sala;
                    }));
                }
                return { ...s, estado: 'Cancelado' };
            }
            return s;
        }));

        if (this.turnoActualLlamado()?.id === id) {
            this.turnoActualLlamado.set(null);
        }

        this.guardarEnStorage();
    }

    getEstadisticasDashboard(): EstadisticasDashboard {
        const todas = this.solicitudes();
        const enEspera = todas.filter(s => s.estado === 'En Espera').length;
        const enSala = todas.filter(s => s.estado === 'En Sala').length;
        const finalizadasHoy = todas.filter(s => s.estado === 'Finalizado').length;
        const totalHoy = todas.length;

        // Distribución por sala
        const mapaSalas: { [key: string]: number } = {};
        this.salas().forEach(s => mapaSalas[s.nombre] = 0);
        todas.forEach(s => {
            if (mapaSalas[s.sala.nombre] !== undefined) {
                mapaSalas[s.sala.nombre]++;
            } else {
                mapaSalas[s.sala.nombre] = 1;
            }
        });

        // Distribución por motivo
        const mapaMotivos: { [key: string]: number } = {};
        todas.forEach(s => {
            mapaMotivos[s.motivo] = (mapaMotivos[s.motivo] || 0) + 1;
        });

        return {
            totalHoy,
            enEspera,
            enSala,
            finalizadasHoy,
            visitasPorSala: Object.entries(mapaSalas).map(([label, count]) => ({ label, count })),
            visitasPorMotivo: Object.entries(mapaMotivos).map(([label, count]) => ({ label, count }))
        };
    }
}

