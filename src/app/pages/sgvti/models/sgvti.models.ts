export type TipoDocumento = 'Cédula' | 'DNI' | 'Pasaporte' | 'RUT' | 'Otro';

export type EstadoSolicitud = 'En Espera' | 'En Sala' | 'Finalizado' | 'Cancelado';

export type PrioridadSolicitud = 'Normal' | 'Preferencial' | 'Urgente';

export interface Visitante {
    id: string;
    tipoDocumento: TipoDocumento;
    documento: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    email: string;
    empresa: string;
    cargo?: string;
    fechaRegistro: string;
    totalVisitas: number;
    estado: 'Activo' | 'Bloqueado';
    observaciones?: string;
}

export interface Sala {
    id: string;
    codigo: string;
    nombre: string;
    piso: string;
    capacidad: number;
    ocupados: number;
    estado: 'Disponible' | 'Ocupada' | 'Mantenimiento';
    responsable?: string;
    descripcion?: string;
}

export interface SolicitudVisita {
    id: string;
    numeroTicket: string;
    turnoNumero: number;
    visitanteId: string;
    visitante: Visitante;
    salaId: string;
    sala: Sala;
    motivo: string;
    motivoDetalle?: string;
    anfitrion: string;
    ingresaEquipo: boolean;
    detalleEquipo?: string;
    prioridad: PrioridadSolicitud;
    estado: EstadoSolicitud;
    fechaHoraSolicitud: string;
    horaIngresoSala?: string;
    horaSalida?: string;
    tiempoPermanencia?: string;
    observaciones?: string;
}

export interface EstadisticasDashboard {
    totalHoy: number;
    enEspera: number;
    enSala: number;
    finalizadasHoy: number;
    visitasPorSala: { label: string; count: number }[];
    visitasPorMotivo: { label: string; count: number }[];
}

