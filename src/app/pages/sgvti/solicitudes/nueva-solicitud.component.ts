import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { SgvtiService } from '../services/sgvti.service';
import { Visitante, Sala, SolicitudVisita, TipoDocumento, PrioridadSolicitud } from '../models/sgvti.models';
import { SgvtiTicketDialogComponent } from '../components/ticket-dialog/ticket-dialog.component';

@Component({
    selector: 'app-sgvti-nueva-solicitud',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        CheckboxModule,
        TagModule,
        SgvtiTicketDialogComponent
    ],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <!-- Encabezado de la página -->
            <div class="col-span-12">
                <div class="card mb-0">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <i class="pi pi-ticket text-primary text-2xl"></i>
                                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">Recepción y Registro de Solicitudes</h1>
                            </div>
                            <p class="text-muted-color m-0 text-sm">
                                Busque el visitante en la base de datos o regístrelo, seleccione la sala de destino, el motivo y emita su ticket de turno.
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <p-button 
                                label="Ver Solicitudes Activas" 
                                icon="pi pi-list" 
                                severity="secondary" 
                                [outlined]="true" 
                                routerLink="/sgvti/solicitudes" />
                            <p-button 
                                label="Pantalla de Turnos" 
                                icon="pi pi-desktop" 
                                severity="info" 
                                [outlined]="true" 
                                routerLink="/sgvti/turnos" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Paso 1: Búsqueda o Registro del Visitante -->
            <div class="col-span-12 lg:col-span-6">
                <div class="card h-full flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between border-b border-surface-200 dark:border-surface-700 pb-3 mb-4">
                            <div class="flex items-center gap-2">
                                <span class="bg-primary/10 text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                                <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 m-0">Datos del Visitante</h2>
                            </div>
                            <p-tag *ngIf="visitanteEncontrado" value="Visitante Registrado" severity="success" icon="pi pi-check" />
                            <p-tag *ngIf="busquedaRealizada && !visitanteEncontrado" value="Nuevo Registro" severity="info" icon="pi pi-user-plus" />
                        </div>

                        <!-- Barra de Búsqueda -->
                        <div class="mb-5 bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                                <i class="pi pi-search mr-1"></i> Buscar por Cédula, DNI o Documento:
                            </label>
                            <div class="flex gap-2">
                                <input 
                                    pInputText 
                                    type="text" 
                                    [(ngModel)]="documentoBusqueda" 
                                    (keyup.enter)="buscarVisitante()"
                                    placeholder="Ej: 1098273645 o 45678912..." 
                                    class="w-full" />
                                <p-button 
                                    label="Buscar" 
                                    icon="pi pi-search" 
                                    severity="primary" 
                                    (onClick)="buscarVisitante()" />
                            </div>
                            <div class="flex items-center justify-between text-xs text-muted-color mt-2">
                                <span>Presione Enter para buscar rápidamente en la base de datos.</span>
                                <button *ngIf="busquedaRealizada" (click)="limpiarFormularioVisitante()" class="text-primary hover:underline cursor-pointer bg-transparent border-none p-0">
                                    Limpiar búsqueda
                                </button>
                            </div>
                        </div>

                        <!-- Formulario de Datos del Visitante -->
                        <div class="grid grid-cols-12 gap-3">
                            <div class="col-span-12 sm:col-span-4">
                                <label class="block text-sm font-medium mb-1">Tipo Doc. *</label>
                                <p-select 
                                    [options]="tiposDocumento" 
                                    [(ngModel)]="visitanteForm.tipoDocumento" 
                                    placeholder="Tipo" 
                                    class="w-full" />
                            </div>

                            <div class="col-span-12 sm:col-span-8">
                                <label class="block text-sm font-medium mb-1">Número de Documento *</label>
                                <input 
                                    pInputText 
                                    type="text" 
                                    [(ngModel)]="visitanteForm.documento" 
                                    placeholder="Número de identificación" 
                                    class="w-full" />
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                                <label class="block text-sm font-medium mb-1">Nombres *</label>
                                <input 
                                    pInputText 
                                    type="text" 
                                    [(ngModel)]="visitanteForm.nombres" 
                                    placeholder="Nombres" 
                                    class="w-full" />
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                                <label class="block text-sm font-medium mb-1">Apellidos *</label>
                                <input 
                                    pInputText 
                                    type="text" 
                                    [(ngModel)]="visitanteForm.apellidos" 
                                    placeholder="Apellidos" 
                                    class="w-full" />
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                                <label class="block text-sm font-medium mb-1">Teléfono / Celular *</label>
                                <input 
                                    pInputText 
                                    type="text" 
                                    [(ngModel)]="visitanteForm.telefono" 
                                    placeholder="+57 300 000 0000" 
                                    class="w-full" />
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                                <label class="block text-sm font-medium mb-1">Correo Electrónico</label>
                                <input 
                                    pInputText 
                                    type="email" 
                                    [(ngModel)]="visitanteForm.email" 
                                    placeholder="correo@ejemplo.com" 
                                    class="w-full" />
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                                <label class="block text-sm font-medium mb-1">Empresa / Entidad</label>
                                <input 
                                    pInputText 
                                    type="text" 
                                    [(ngModel)]="visitanteForm.empresa" 
                                    placeholder="Empresa o 'Particular'" 
                                    class="w-full" />
                            </div>

                            <div class="col-span-12 sm:col-span-6">
                                <label class="block text-sm font-medium mb-1">Cargo / Especialidad</label>
                                <input 
                                    pInputText 
                                    type="text" 
                                    [(ngModel)]="visitanteForm.cargo" 
                                    placeholder="Ej: Ingeniero de Soporte, Abogado" 
                                    class="w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Banner de información de visitas previas -->
                    <div *ngIf="visitanteEncontrado" class="mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-history text-emerald-600 dark:text-emerald-400 text-lg"></i>
                            <div>
                                <span class="text-xs font-semibold text-emerald-800 dark:text-emerald-200 block">Historial de Visitas</span>
                                <span class="text-xs text-emerald-700 dark:text-emerald-300">Este visitante tiene <strong>{{ visitanteEncontrado.totalVisitas }}</strong> visita(s) previa(s) registradas.</span>
                            </div>
                        </div>
                        <span class="text-xs font-mono bg-white dark:bg-surface-800 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded border border-emerald-200">
                            Activo
                        </span>
                    </div>
                </div>
            </div>

            <!-- Paso 2: Solicitud (Destino, Sala, Motivo y Emisión) -->
            <div class="col-span-12 lg:col-span-6">
                <div class="card h-full flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-2 border-b border-surface-200 dark:border-surface-700 pb-3 mb-4">
                            <span class="bg-primary/10 text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 m-0">Detalles de la Visita y Destino</h2>
                        </div>

                        <div class="grid grid-cols-12 gap-4">
                            <!-- Selección de Sala -->
                            <div class="col-span-12">
                                <label class="block text-sm font-medium mb-1">
                                    <i class="pi pi-building mr-1 text-primary"></i> Sala u Oficina de Destino *
                                </label>
                                <p-select 
                                    [options]="salasDisponibles" 
                                    [(ngModel)]="solicitudForm.salaId" 
                                    optionLabel="nombre" 
                                    optionValue="id" 
                                    placeholder="Seleccione la sala o departamento de destino" 
                                    class="w-full">
                                    <ng-template #selectedItem let-selectedOption>
                                        <div class="flex items-center justify-between w-full" *ngIf="selectedOption">
                                            <span class="font-medium">{{ selectedOption.nombre }}</span>
                                            <span class="text-xs text-muted-color">({{ selectedOption.piso }})</span>
                                        </div>
                                    </ng-template>
                                    <ng-template #item let-sala>
                                        <div class="flex items-center justify-between w-full py-1">
                                            <div>
                                                <div class="font-medium text-surface-900 dark:text-surface-0">{{ sala.nombre }}</div>
                                                <div class="text-xs text-muted-color">{{ sala.piso }} &bull; Resp: {{ sala.responsable }}</div>
                                            </div>
                                            <span class="text-xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-muted-color">
                                                Cap: {{ sala.capacidad }}
                                            </span>
                                        </div>
                                    </ng-template>
                                </p-select>
                            </div>

                            <!-- Motivo de la Visita -->
                            <div class="col-span-12 sm:col-span-6">
                                <label class="block text-sm font-medium mb-1">
                                    <i class="pi pi-compass mr-1 text-primary"></i> Motivo de la Visita *
                                </label>
                                <p-select 
                                    [options]="motivosVisita" 
                                    [(ngModel)]="solicitudForm.motivo" 
                                    placeholder="Seleccione el motivo" 
                                    class="w-full" />
                            </div>

                            <!-- Anfitrión / Persona que lo recibe -->
                            <div class="col-span-12 sm:col-span-6">
                                <label class="block text-sm font-medium mb-1">
                                    <i class="pi pi-user mr-1 text-primary"></i> Anfitrión / Funcionario a Visitar *
                                </label>
                                <input 
                                    pInputText 
                                    type="text" 
                                    [(ngModel)]="solicitudForm.anfitrion" 
                                    placeholder="Nombre del empleado o área que recibe" 
                                    class="w-full" />
                            </div>

                            <!-- Detalle del Motivo / Observaciones -->
                            <div class="col-span-12">
                                <label class="block text-sm font-medium mb-1">Descripción / Asunto Específico</label>
                                <textarea 
                                    pTextarea 
                                    rows="2" 
                                    [(ngModel)]="solicitudForm.motivoDetalle" 
                                    placeholder="Detalles sobre el trámite, reunión o trabajo a realizar..." 
                                    class="w-full"></textarea>
                            </div>

                            <!-- Prioridad -->
                            <div class="col-span-12 sm:col-span-6">
                                <label class="block text-sm font-medium mb-1">Prioridad de Atención</label>
                                <p-select 
                                    [options]="prioridades" 
                                    [(ngModel)]="solicitudForm.prioridad" 
                                    class="w-full" />
                            </div>

                            <!-- Ingreso de Equipos -->
                            <div class="col-span-12 sm:col-span-6 flex flex-col justify-center">
                                <div class="flex items-center gap-2 pt-4">
                                    <p-checkbox 
                                        [(ngModel)]="solicitudForm.ingresaEquipo" 
                                        [binary]="true" 
                                        inputId="ingresaEquipoCheck" />
                                    <label for="ingresaEquipoCheck" class="text-sm font-medium cursor-pointer">
                                        ¿Ingresa con laptop o equipos de valor?
                                    </label>
                                </div>
                            </div>

                            <!-- Detalle de Equipos (Condicional) -->
                            <div class="col-span-12" *ngIf="solicitudForm.ingresaEquipo">
                                <label class="block text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
                                    <i class="pi pi-desktop mr-1"></i> Detalle de Equipos / Seriales:
                                </label>
                                <input 
                                    pInputText 
                                    type="text" 
                                    [(ngModel)]="solicitudForm.detalleEquipo" 
                                    placeholder="Ej: Laptop Lenovo ThinkPad Serial #TP-887766, herramientas..." 
                                    class="w-full" />
                            </div>
                        </div>
                    </div>

                    <!-- Botón de Registro y Emisión de Ticket -->
                    <div class="border-t border-surface-200 dark:border-surface-700 pt-5 mt-5">
                        <div class="flex flex-col sm:flex-row gap-3 justify-end items-center">
                            <p-button 
                                label="Limpiar Todo" 
                                icon="pi pi-trash" 
                                severity="secondary" 
                                [text]="true" 
                                (onClick)="limpiarTodo()" />
                            
                            <p-button 
                                label="Registrar Solicitud y Emitir Ticket" 
                                icon="pi pi-ticket" 
                                severity="primary" 
                                size="large"
                                [loading]="guardando"
                                (onClick)="registrarSolicitud()" 
                                styleClass="w-full sm:w-auto font-bold shadow-md" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Ticket Generado -->
        <app-sgvti-ticket-dialog 
            [(visible)]="modalTicketVisible" 
            [solicitud]="solicitudGenerada"
            (nuevaSolicitud)="onNuevaSolicitudDesdeModal()" />
    `
})
export class SgvtiNuevaSolicitudComponent implements OnInit {
    // Búsqueda
    documentoBusqueda: string = '';
    busquedaRealizada: boolean = false;
    visitanteEncontrado: Visitante | null = null;

    // Catálogos
    tiposDocumento: TipoDocumento[] = ['Cédula', 'DNI', 'Pasaporte', 'RUT', 'Otro'];
    prioridades: PrioridadSolicitud[] = ['Normal', 'Preferencial', 'Urgente'];
    motivosVisita: string[] = [
        'Soporte Técnico',
        'Reunión de Negocios',
        'Mantenimiento de Servidores / Infraestructura',
        'Entrevista de Trabajo',
        'Entrega de Documentos / Mensajería',
        'Auditoría',
        'Trámite Administrativo',
        'Reunión con Proveedores',
        'Otro'
    ];

    salasDisponibles: Sala[] = [];

    // Formulario de Visitante
    visitanteForm = {
        id: '',
        tipoDocumento: 'Cédula' as TipoDocumento,
        documento: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        empresa: '',
        cargo: ''
    };

    // Formulario de Solicitud
    solicitudForm = {
        salaId: '',
        motivo: 'Soporte Técnico',
        motivoDetalle: '',
        anfitrion: '',
        prioridad: 'Normal' as PrioridadSolicitud,
        ingresaEquipo: false,
        detalleEquipo: ''
    };

    // Estado del guardado y Ticket emitido
    guardando: boolean = false;
    modalTicketVisible: boolean = false;
    solicitudGenerada: SolicitudVisita | null = null;

    constructor(
        public sgvtiService: SgvtiService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.salasDisponibles = this.sgvtiService.getSalas();
        if (this.salasDisponibles.length > 0) {
            this.solicitudForm.salaId = this.salasDisponibles[0].id;
            this.solicitudForm.anfitrion = this.salasDisponibles[0].responsable || '';
        }
    }

    buscarVisitante(): void {
        if (!this.documentoBusqueda.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campo vacío',
                detail: 'Por favor ingrese un número de documento para buscar.'
            });
            return;
        }

        const encontrado = this.sgvtiService.buscarVisitantePorDocumento(this.documentoBusqueda);
        this.busquedaRealizada = true;

        if (encontrado) {
            this.visitanteEncontrado = encontrado;
            this.visitanteForm = {
                id: encontrado.id,
                tipoDocumento: encontrado.tipoDocumento,
                documento: encontrado.documento,
                nombres: encontrado.nombres,
                apellidos: encontrado.apellidos,
                telefono: encontrado.telefono,
                email: encontrado.email,
                empresa: encontrado.empresa,
                cargo: encontrado.cargo || ''
            };
            this.messageService.add({
                severity: 'success',
                summary: '¡Visitante Encontrado!',
                detail: `${encontrado.nombres} ${encontrado.apellidos} - ${encontrado.empresa || 'Particular'}`
            });
        } else {
            this.visitanteEncontrado = null;
            this.visitanteForm.documento = this.documentoBusqueda.trim();
            this.messageService.add({
                severity: 'info',
                summary: 'Visitante No Encontrado',
                detail: 'Complete los datos del visitante para registrar su ingreso por primera vez.'
            });
        }
    }

    limpiarFormularioVisitante(): void {
        this.documentoBusqueda = '';
        this.busquedaRealizada = false;
        this.visitanteEncontrado = null;
        this.visitanteForm = {
            id: '',
            tipoDocumento: 'Cédula',
            documento: '',
            nombres: '',
            apellidos: '',
            telefono: '',
            email: '',
            empresa: '',
            cargo: ''
        };
    }

    limpiarTodo(): void {
        this.limpiarFormularioVisitante();
        this.solicitudForm = {
            salaId: this.salasDisponibles.length > 0 ? this.salasDisponibles[0].id : '',
            motivo: 'Soporte Técnico',
            motivoDetalle: '',
            anfitrion: this.salasDisponibles.length > 0 ? (this.salasDisponibles[0].responsable || '') : '',
            prioridad: 'Normal',
            ingresaEquipo: false,
            detalleEquipo: ''
        };
    }

    registrarSolicitud(): void {
        // Validaciones del visitante
        if (!this.visitanteForm.documento.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe ingresar el número de documento del visitante.' });
            return;
        }
        if (!this.visitanteForm.nombres.trim() || !this.visitanteForm.apellidos.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe ingresar nombres y apellidos del visitante.' });
            return;
        }
        if (!this.visitanteForm.telefono.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe ingresar un teléfono de contacto.' });
            return;
        }

        // Validaciones de la solicitud
        if (!this.solicitudForm.salaId) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar una sala de destino.' });
            return;
        }
        if (!this.solicitudForm.motivo) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar el motivo de la visita.' });
            return;
        }
        if (!this.solicitudForm.anfitrion.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe indicar quién recibe o autoriza la visita (anfitrión).' });
            return;
        }

        this.guardando = true;

        try {
            // 1. Obtener o crear visitante
            let visitanteId = this.visitanteForm.id;
            if (this.visitanteEncontrado) {
                // Actualizar datos si cambiaron
                this.sgvtiService.actualizarVisitante({
                    ...this.visitanteEncontrado,
                    tipoDocumento: this.visitanteForm.tipoDocumento,
                    documento: this.visitanteForm.documento,
                    nombres: this.visitanteForm.nombres,
                    apellidos: this.visitanteForm.apellidos,
                    telefono: this.visitanteForm.telefono,
                    email: this.visitanteForm.email,
                    empresa: this.visitanteForm.empresa,
                    cargo: this.visitanteForm.cargo
                });
                visitanteId = this.visitanteEncontrado.id;
            } else {
                // Registrar nuevo visitante
                const nuevoVisitante = this.sgvtiService.crearVisitante({
                    tipoDocumento: this.visitanteForm.tipoDocumento,
                    documento: this.visitanteForm.documento,
                    nombres: this.visitanteForm.nombres,
                    apellidos: this.visitanteForm.apellidos,
                    telefono: this.visitanteForm.telefono,
                    email: this.visitanteForm.email,
                    empresa: this.visitanteForm.empresa || 'Particular',
                    cargo: this.visitanteForm.cargo,
                    estado: 'Activo'
                });
                visitanteId = nuevoVisitante.id;
            }

            // 2. Crear Solicitud y Emitir Ticket
            const solicitud = this.sgvtiService.crearSolicitud({
                visitanteId,
                salaId: this.solicitudForm.salaId,
                motivo: this.solicitudForm.motivo,
                motivoDetalle: this.solicitudForm.motivoDetalle,
                anfitrion: this.solicitudForm.anfitrion,
                ingresaEquipo: this.solicitudForm.ingresaEquipo,
                detalleEquipo: this.solicitudForm.ingresaEquipo ? this.solicitudForm.detalleEquipo : undefined,
                prioridad: this.solicitudForm.prioridad
            });

            this.solicitudGenerada = solicitud;
            this.modalTicketVisible = true;

            this.messageService.add({
                severity: 'success',
                summary: '¡Turno Emitido con Éxito!',
                detail: `Ticket ${solicitud.numeroTicket} asignado a ${this.visitanteForm.nombres} ${this.visitanteForm.apellidos}`
            });

        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error al registrar',
                detail: error.message || 'Ocurrió un error inesperado al generar el ticket.'
            });
        } finally {
            this.guardando = false;
        }
    }

    onNuevaSolicitudDesdeModal(): void {
        this.limpiarTodo();
    }
}

