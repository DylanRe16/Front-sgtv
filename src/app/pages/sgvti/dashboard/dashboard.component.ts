import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { SgvtiService } from '../services/sgvti.service';
import { LayoutService } from '../../../layout/service/layout.service';
import { SolicitudVisita, EstadoSolicitud } from '../models/sgvti.models';
import { SgvtiTicketDialogComponent } from '../components/ticket-dialog/ticket-dialog.component';

@Component({
    selector: 'app-sgvti-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        TableModule,
        TagModule,
        ChartModule,
        SgvtiTicketDialogComponent
    ],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <!-- Barra de Bienvenida y Accesos Rápidos -->
            <div class="col-span-12">
                <div class="card mb-0 bg-gradient-to-r from-surface-0 to-surface-50 dark:from-surface-900 dark:to-surface-800 border-l-4 border-l-primary">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <span class="text-xs uppercase font-bold tracking-widest text-primary block mb-1">
                                Panel de Control Principal &bull; Recepción SGVTI
                            </span>
                            <h1 class="text-2xl lg:text-3xl font-extrabold text-surface-900 dark:text-surface-0 m-0">
                                Sistema de Gestión de Visitas y Solicitudes
                            </h1>
                            <p class="text-muted-color text-sm mt-1 mb-0">
                                Registro rápido de visitantes, emisión de turnos/tickets y control de aforo por sala.
                            </p>
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <p-button 
                                label="Nueva Solicitud / Emitir Ticket" 
                                icon="pi pi-ticket" 
                                severity="primary" 
                                size="large"
                                routerLink="/sgvti/solicitudes/nueva" 
                                styleClass="font-bold shadow" />
                            <p-button 
                                label="Monitor de Turnos" 
                                icon="pi pi-desktop" 
                                severity="info" 
                                [outlined]="true"
                                routerLink="/sgvti/turnos" />
                            <p-button 
                                icon="pi pi-refresh" 
                                severity="secondary" 
                                [outlined]="true"
                                (onClick)="reiniciarDatosDemo()" 
                                pTooltip="Restablecer Datos de Demostración" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Métricas Clave (4 Tarjetas Sakai) -->
            <!-- 1. Total Solicitudes Hoy -->
            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-3">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Total Solicitudes Hoy</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                                {{ stats.totalHoy }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-xl w-12 h-12">
                            <i class="pi pi-ticket text-blue-600 dark:text-blue-400 text-xl font-bold"></i>
                        </div>
                    </div>
                    <span class="text-blue-600 dark:text-blue-400 font-semibold text-xs">Registros de ingreso </span>
                    <span class="text-muted-color text-xs">en la jornada</span>
                </div>
            </div>

            <!-- 2. En Espera / Turnos -->
            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-3">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Visitantes en Espera</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl text-amber-600 dark:text-amber-400">
                                {{ stats.enEspera }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 rounded-xl w-12 h-12">
                            <i class="pi pi-clock text-amber-600 dark:text-amber-400 text-xl font-bold"></i>
                        </div>
                    </div>
                    <span class="text-amber-600 dark:text-amber-400 font-semibold text-xs">En sala de espera </span>
                    <span class="text-muted-color text-xs">aguardando llamado</span>
                </div>
            </div>

            <!-- 3. En Sala / Activos -->
            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-3">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Visitantes en Sala</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                                {{ stats.enSala }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 rounded-xl w-12 h-12">
                            <i class="pi pi-building text-emerald-600 dark:text-emerald-400 text-xl font-bold"></i>
                        </div>
                    </div>
                    <span class="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">En instalaciones </span>
                    <span class="text-muted-color text-xs">atendiéndose ahora</span>
                </div>
            </div>

            <!-- 4. Finalizadas Hoy -->
            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-3">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Visitas Concluidas</span>
                            <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                                {{ stats.finalizadasHoy }}
                            </div>
                        </div>
                        <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-xl w-12 h-12">
                            <i class="pi pi-check-circle text-purple-600 dark:text-purple-400 text-xl font-bold"></i>
                        </div>
                    </div>
                    <span class="text-purple-600 dark:text-purple-400 font-semibold text-xs">Salidas registradas </span>
                    <span class="text-muted-color text-xs">conforme</span>
                </div>
            </div>

            <!-- Gráficos de Afluencia y Motivos -->
            <div class="col-span-12 xl:col-span-7">
                <div class="card h-full">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 m-0">
                            Afluencia de Visitas por Sala de Destino
                        </h3>
                        <span class="text-xs text-muted-color">Distribución acumulada</span>
                    </div>
                    <div class="h-72">
                        <p-chart type="bar" [data]="chartSalasData" [options]="chartBarOptions" class="h-full" />
                    </div>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-5">
                <div class="card h-full">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 m-0">
                            Distribución por Motivo de Visita
                        </h3>
                        <span class="text-xs text-muted-color">Porcentaje</span>
                    </div>
                    <div class="h-72 flex justify-center items-center">
                        <p-chart type="doughnut" [data]="chartMotivosData" [options]="chartDoughnutOptions" class="w-full max-w-[280px]" />
                    </div>
                </div>
            </div>

            <!-- Tabla de Solicitudes Recientes y Control Rápido -->
            <div class="col-span-12">
                <div class="card">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <div>
                            <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 m-0">
                                Solicitudes Recientes
                            </h3>
                            <span class="text-xs text-muted-color">Últimos turnos generados en la recepción</span>
                        </div>
                        <p-button 
                            label="Ver Todo el Historial" 
                            icon="pi pi-arrow-right" 
                            iconPos="right" 
                            severity="secondary" 
                            [text]="true" 
                            routerLink="/sgvti/solicitudes" />
                    </div>

                    <p-table 
                        [value]="sgvtiService.solicitudes().slice(0, 6)" 
                        responsiveLayout="scroll" 
                        styleClass="p-datatable-sm">
                        <ng-template #header>
                            <tr>
                                <th>Ticket</th>
                                <th>Visitante</th>
                                <th>Sala Destino</th>
                                <th>Motivo</th>
                                <th>Hora</th>
                                <th>Estado</th>
                                <th class="text-center">Acción Rápida</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-s>
                            <tr>
                                <td>
                                    <span class="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">
                                        {{ s.numeroTicket }}
                                    </span>
                                </td>
                                <td>
                                    <div class="font-semibold text-sm">{{ s.visitante.nombres }} {{ s.visitante.apellidos }}</div>
                                    <div class="text-xs text-muted-color">{{ s.visitante.tipoDocumento }}: {{ s.visitante.documento }}</div>
                                </td>
                                <td>
                                    <span class="font-medium text-sm">{{ s.sala.nombre }}</span>
                                </td>
                                <td>
                                    <span class="text-sm">{{ s.motivo }}</span>
                                </td>
                                <td>
                                    <span class="text-xs text-muted-color font-mono">{{ s.fechaHoraSolicitud }}</span>
                                </td>
                                <td>
                                    <p-tag [value]="s.estado" [severity]="getSeverity(s.estado)" />
                                </td>
                                <td class="text-center">
                                    <div class="flex justify-center gap-1">
                                        <p-button 
                                            *ngIf="s.estado === 'En Espera'"
                                            icon="pi pi-volume-up" 
                                            severity="info" 
                                            size="small" 
                                            [text]="true"
                                            (onClick)="llamarTurno(s)" 
                                            pTooltip="Llamar Turno" />
                                        <p-button 
                                            *ngIf="s.estado === 'En Espera'"
                                            icon="pi pi-sign-in" 
                                            severity="success" 
                                            size="small" 
                                            [text]="true"
                                            (onClick)="marcarIngreso(s)" 
                                            pTooltip="Marcar Ingreso" />
                                        <p-button 
                                            *ngIf="s.estado === 'En Sala'"
                                            icon="pi pi-sign-out" 
                                            severity="warn" 
                                            size="small" 
                                            [text]="true"
                                            (onClick)="marcarSalida(s)" 
                                            pTooltip="Registrar Salida" />
                                        <p-button 
                                            icon="pi pi-print" 
                                            severity="secondary" 
                                            size="small" 
                                            [text]="true"
                                            (onClick)="verTicket(s)" 
                                            pTooltip="Ver Ticket" />
                                    </div>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>
        </div>

        <app-sgvti-ticket-dialog 
            [(visible)]="modalTicketVisible" 
            [solicitud]="solicitudSeleccionada"
            [showNuevaBtn]="false" />
    `
})
export class SgvtiDashboardComponent implements OnInit, OnDestroy {
    chartSalasData: any;
    chartMotivosData: any;
    chartBarOptions: any;
    chartDoughnutOptions: any;

    modalTicketVisible: boolean = false;
    solicitudSeleccionada: SolicitudVisita | null = null;

    private subscription!: Subscription;

    constructor(
        public sgvtiService: SgvtiService,
        public layoutService: LayoutService
    ) {}

    ngOnInit(): void {
        this.initCharts();
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initCharts();
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    get stats() {
        return this.sgvtiService.getEstadisticasDashboard();
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

    initCharts(): void {
        const stats = this.sgvtiService.getEstadisticasDashboard();
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#e5e7eb';

        // Gráfico de Salas
        const labelsSalas = stats.visitasPorSala.map(v => v.label.split(' - ')[0]);
        const dataSalas = stats.visitasPorSala.map(v => v.count);

        this.chartSalasData = {
            labels: labelsSalas,
            datasets: [
                {
                    label: 'Solicitudes / Visitas',
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderRadius: 6,
                    data: dataSalas
                }
            ]
        };

        this.chartBarOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    ticks: { color: textMutedColor },
                    grid: { color: surfaceBorder, drawBorder: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: textMutedColor, stepSize: 1 },
                    grid: { color: surfaceBorder, drawBorder: false }
                }
            }
        };

        // Gráfico de Motivos
        const labelsMotivos = stats.visitasPorMotivo.map(v => v.label);
        const dataMotivos = stats.visitasPorMotivo.map(v => v.count);
        const coloresMotivos = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

        this.chartMotivosData = {
            labels: labelsMotivos,
            datasets: [
                {
                    data: dataMotivos.length ? dataMotivos : [1],
                    backgroundColor: coloresMotivos.slice(0, labelsMotivos.length),
                    hoverBackgroundColor: coloresMotivos.slice(0, labelsMotivos.length)
                }
            ]
        };

        this.chartDoughnutOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, boxWidth: 12 }
                }
            }
        };
    }

    llamarTurno(s: SolicitudVisita): void {
        this.sgvtiService.llamarTurno(s.id);
    }

    marcarIngreso(s: SolicitudVisita): void {
        this.sgvtiService.registrarIngresoSala(s.id);
        this.initCharts();
    }

    marcarSalida(s: SolicitudVisita): void {
        this.sgvtiService.registrarSalida(s.id);
        this.initCharts();
    }

    verTicket(s: SolicitudVisita): void {
        this.solicitudSeleccionada = s;
        this.modalTicketVisible = true;
    }

    reiniciarDatosDemo(): void {
        this.sgvtiService.cargarDatosDemo();
        this.initCharts();
    }
}
