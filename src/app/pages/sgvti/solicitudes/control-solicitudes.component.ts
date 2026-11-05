import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SgvtiService } from '../services/sgvti.service';
import { SolicitudVisita, EstadoSolicitud } from '../models/sgvti.models';
import { SgvtiTicketDialogComponent } from '../components/ticket-dialog/ticket-dialog.component';

@Component({
    selector: 'app-sgvti-control-solicitudes',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        SelectModule,
        SgvtiTicketDialogComponent
    ],
    template: `
        <div class="card">
            <!-- Header y Acciones -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-list-check text-primary text-2xl"></i>
                        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">Control y Monitoreo de Solicitudes</h1>
                    </div>
                    <p class="text-muted-color m-0 text-sm">
                        Supervise las visitas activas, llame turnos, registre ingresos a salas y salidas de las instalaciones.
                    </p>
                </div>
                <div class="flex gap-2">
                    <p-button 
                        label="Nueva Solicitud" 
                        icon="pi pi-plus" 
                        severity="primary" 
                        routerLink="/sgvti/solicitudes/nueva" />
                    <p-button 
                        label="Pantalla de Turnos" 
                        icon="pi pi-desktop" 
                        severity="info" 
                        [outlined]="true"
                        routerLink="/sgvti/turnos" />
                </div>
            </div>

            <!-- Filtros Rápidos por Estado -->
            <div class="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-surface-200 dark:border-surface-700">
                <button 
                    (click)="filtroEstado = 'TODOS'" 
                    [ngClass]="filtroEstado === 'TODOS' ? 'bg-primary text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'"
                    class="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors">
                    Todos ({{ sgvtiService.solicitudes().length }})
                </button>
                <button 
                    (click)="filtroEstado = 'En Espera'" 
                    [ngClass]="filtroEstado === 'En Espera' ? 'bg-amber-500 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'"
                    class="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-300"></span>
                    En Espera ({{ sgvtiService.solicitudesEnEspera().length }})
                </button>
                <button 
                    (click)="filtroEstado = 'En Sala'" 
                    [ngClass]="filtroEstado === 'En Sala' ? 'bg-emerald-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'"
                    class="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-300"></span>
                    En Sala / Activos ({{ sgvtiService.solicitudesEnSala().length }})
                </button>
                <button 
                    (click)="filtroEstado = 'Finalizado'" 
                    [ngClass]="filtroEstado === 'Finalizado' ? 'bg-surface-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300'"
                    class="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-surface-400"></span>
                    Finalizados ({{ sgvtiService.solicitudesFinalizadas().length }})
                </button>
            </div>

            <!-- Tabla de PrimeNG -->
            <p-table 
                #dt 
                [value]="solicitudesFiltradas" 
                [paginator]="true" 
                [rows]="10" 
                [rowsPerPageOptions]="[10, 20, 50]"
                [globalFilterFields]="['numeroTicket', 'visitante.nombres', 'visitante.apellidos', 'visitante.documento', 'visitante.empresa', 'sala.nombre', 'motivo', 'anfitrion']"
                responsiveLayout="scroll"
                styleClass="p-datatable-striped">
                
                <ng-template #caption>
                    <div class="flex items-center justify-between flex-wrap gap-3">
                        <span class="text-lg font-semibold text-surface-900 dark:text-surface-0">
                            Registros ({{ solicitudesFiltradas.length }})
                        </span>
                        <div class="flex items-center gap-2">
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search" />
                                <input 
                                    pInputText 
                                    type="text" 
                                    (input)="onGlobalFilter(dt, $event)" 
                                    placeholder="Buscar ticket, cédula, nombre..." 
                                    class="w-64" />
                            </p-iconfield>
                            <p-button 
                                icon="pi pi-file-excel" 
                                severity="secondary" 
                                [outlined]="true" 
                                (onClick)="dt.exportCSV()" 
                                pTooltip="Exportar a CSV" />
                        </div>
                    </div>
                </ng-template>

                <ng-template #header>
                    <tr>
                        <th pSortableColumn="numeroTicket" style="min-width: 8rem">
                            Turno / Ticket <p-sortIcon field="numeroTicket" />
                        </th>
                        <th pSortableColumn="visitante.nombres" style="min-width: 14rem">
                            Visitante <p-sortIcon field="visitante.nombres" />
                        </th>
                        <th pSortableColumn="sala.nombre" style="min-width: 12rem">
                            Sala / Destino <p-sortIcon field="sala.nombre" />
                        </th>
                        <th pSortableColumn="motivo" style="min-width: 12rem">
                            Motivo & Anfitrión <p-sortIcon field="motivo" />
                        </th>
                        <th pSortableColumn="fechaHoraSolicitud" style="min-width: 9rem">
                            Registro <p-sortIcon field="fechaHoraSolicitud" />
                        </th>
                        <th pSortableColumn="estado" style="min-width: 8rem">
                            Estado <p-sortIcon field="estado" />
                        </th>
                        <th style="min-width: 14rem; text-align: center">Acciones de Control</th>
                    </tr>
                </ng-template>

                <ng-template #body let-solicitud>
                    <tr>
                        <!-- Turno / Ticket -->
                        <td>
                            <div class="font-mono font-bold text-base text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                                {{ solicitud.numeroTicket }}
                            </div>
                            <div class="text-[10px] uppercase font-semibold text-muted-color mt-0.5">
                                {{ solicitud.prioridad }}
                            </div>
                        </td>

                        <!-- Visitante -->
                        <td>
                            <div class="font-semibold text-surface-900 dark:text-surface-0">
                                {{ solicitud.visitante.nombres }} {{ solicitud.visitante.apellidos }}
                            </div>
                            <div class="text-xs text-muted-color flex items-center gap-1">
                                <i class="pi pi-id-card text-[10px]"></i>
                                <span>{{ solicitud.visitante.tipoDocumento }}: {{ solicitud.visitante.documento }}</span>
                            </div>
                            <div class="text-xs text-surface-500 font-medium" *ngIf="solicitud.visitante.empresa">
                                <i class="pi pi-briefcase text-[10px] mr-1"></i>{{ solicitud.visitante.empresa }}
                            </div>
                        </td>

                        <!-- Sala / Destino -->
                        <td>
                            <div class="font-medium text-surface-900 dark:text-surface-0">{{ solicitud.sala.nombre }}</div>
                            <div class="text-xs text-muted-color">{{ solicitud.sala.piso }}</div>
                            <span *ngIf="solicitud.ingresaEquipo" class="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded mt-1" [title]="solicitud.detalleEquipo || 'Con equipos'">
                                <i class="pi pi-desktop text-[10px]"></i> Con equipos
                            </span>
                        </td>

                        <!-- Motivo & Anfitrión -->
                        <td>
                            <div class="text-sm font-medium">{{ solicitud.motivo }}</div>
                            <div class="text-xs text-muted-color">
                                <span class="font-normal">Recibe:</span> {{ solicitud.anfitrion }}
                            </div>
                            <div *ngIf="solicitud.motivoDetalle" class="text-xs text-surface-500 italic truncate max-w-[200px]" [title]="solicitud.motivoDetalle">
                                {{ solicitud.motivoDetalle }}
                            </div>
                        </td>

                        <!-- Registro y Duración -->
                        <td>
                            <div class="text-xs font-medium">{{ solicitud.fechaHoraSolicitud }}</div>
                            <div *ngIf="solicitud.tiempoPermanencia" class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                Duración: {{ solicitud.tiempoPermanencia }}
                            </div>
                            <div *ngIf="solicitud.horaIngresoSala && !solicitud.horaSalida" class="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                                Ingreso: {{ solicitud.horaIngresoSala }}
                            </div>
                        </td>

                        <!-- Estado -->
                        <td>
                            <p-tag 
                                [value]="solicitud.estado" 
                                [severity]="getSeverity(solicitud.estado)" />
                        </td>

                        <!-- Acciones -->
                        <td class="text-center">
                            <div class="flex items-center justify-center gap-1">
                                <!-- Botón Llamar a Sala (Si está en espera) -->
                                <p-button 
                                    *ngIf="solicitud.estado === 'En Espera'"
                                    icon="pi pi-volume-up" 
                                    severity="info" 
                                    size="small"
                                    (onClick)="llamarTurno(solicitud)" 
                                    pTooltip="Llamar Turno en Pantalla" 
                                    tooltipPosition="top" />

                                <!-- Botón Marcar Ingreso a Sala (Si está en espera) -->
                                <p-button 
                                    *ngIf="solicitud.estado === 'En Espera'"
                                    icon="pi pi-sign-in" 
                                    severity="success" 
                                    size="small"
                                    (onClick)="marcarIngreso(solicitud)" 
                                    pTooltip="Registrar Ingreso a Sala" 
                                    tooltipPosition="top" />

                                <!-- Botón Registrar Salida (Si está en sala) -->
                                <p-button 
                                    *ngIf="solicitud.estado === 'En Sala'"
                                    icon="pi pi-sign-out" 
                                    severity="warn" 
                                    size="small"
                                    (onClick)="confirmarSalida(solicitud)" 
                                    pTooltip="Registrar Salida / Finalizar" 
                                    tooltipPosition="top" />

                                <!-- Botón Reimprimir Ticket -->
                                <p-button 
                                    icon="pi pi-print" 
                                    severity="secondary" 
                                    size="small"
                                    [outlined]="true"
                                    (onClick)="abrirTicket(solicitud)" 
                                    pTooltip="Ver / Imprimir Ticket" 
                                    tooltipPosition="top" />

                                <!-- Botón Cancelar (Si está en espera) -->
                                <p-button 
                                    *ngIf="solicitud.estado === 'En Espera'"
                                    icon="pi pi-times" 
                                    severity="danger" 
                                    size="small"
                                    [text]="true"
                                    (onClick)="confirmarCancelacion(solicitud)" 
                                    pTooltip="Cancelar Solicitud" 
                                    tooltipPosition="top" />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template #emptymessage>
                    <tr>
                        <td colspan="7" class="text-center p-6 text-muted-color">
                            <i class="pi pi-inbox text-4xl mb-2 block"></i>
                            No se encontraron solicitudes con el filtro actual.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Diálogo del Ticket -->
        <app-sgvti-ticket-dialog 
            [(visible)]="modalTicketVisible" 
            [solicitud]="solicitudSeleccionada"
            [showNuevaBtn]="false" />
    `
})
export class SgvtiControlSolicitudesComponent implements OnInit {
    filtroEstado: string = 'TODOS';
    modalTicketVisible: boolean = false;
    solicitudSeleccionada: SolicitudVisita | null = null;

    constructor(
        public sgvtiService: SgvtiService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {}

    get solicitudesFiltradas(): SolicitudVisita[] {
        const todas = this.sgvtiService.solicitudes();
        if (this.filtroEstado === 'TODOS') return todas;
        return todas.filter(s => s.estado === this.filtroEstado);
    }

    onGlobalFilter(table: any, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getSeverity(estado: EstadoSolicitud): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (estado) {
            case 'En Espera':
                return 'warn';
            case 'En Sala':
                return 'success';
            case 'Finalizado':
                return 'secondary';
            case 'Cancelado':
                return 'danger';
            default:
                return 'info';
        }
    }

    llamarTurno(solicitud: SolicitudVisita): void {
        this.sgvtiService.llamarTurno(solicitud.id);
        this.messageService.add({
            severity: 'info',
            summary: 'Turno Anunciado en Pantalla',
            detail: `Llamando turno ${solicitud.numeroTicket}: ${solicitud.visitante.nombres} -> ${solicitud.sala.nombre}`
        });
    }

    marcarIngreso(solicitud: SolicitudVisita): void {
        this.sgvtiService.registrarIngresoSala(solicitud.id);
        this.messageService.add({
            severity: 'success',
            summary: 'Ingreso Registrado',
            detail: `${solicitud.visitante.nombres} ha ingresado a la ${solicitud.sala.nombre}`
        });
    }

    confirmarSalida(solicitud: SolicitudVisita): void {
        this.confirmationService.confirm({
            message: `¿Desea registrar la salida del visitante ${solicitud.visitante.nombres} ${solicitud.visitante.apellidos}?`,
            header: 'Confirmar Salida',
            icon: 'pi pi-sign-out',
            acceptLabel: 'Sí, Registrar Salida',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-warn',
            accept: () => {
                this.sgvtiService.registrarSalida(solicitud.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Salida Registrada',
                    detail: `Visita ${solicitud.numeroTicket} concluida con éxito.`
                });
            }
        });
    }

    confirmarCancelacion(solicitud: SolicitudVisita): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de que desea cancelar la solicitud ${solicitud.numeroTicket}?`,
            header: 'Cancelar Solicitud',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, Cancelar',
            rejectLabel: 'Volver',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.sgvtiService.cancelarSolicitud(solicitud.id);
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Solicitud Cancelada',
                    detail: `La solicitud ${solicitud.numeroTicket} ha sido cancelada.`
                });
            }
        });
    }

    abrirTicket(solicitud: SolicitudVisita): void {
        this.solicitudSeleccionada = solicitud;
        this.modalTicketVisible = true;
    }
}

