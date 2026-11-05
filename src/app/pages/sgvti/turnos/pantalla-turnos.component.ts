import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SgvtiService } from '../services/sgvti.service';
import { SolicitudVisita } from '../models/sgvti.models';

@Component({
    selector: 'app-sgvti-pantalla-turnos',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    template: `
        <div class="min-h-[80vh] flex flex-col justify-between">
            <!-- Header de la Pantalla de Turnos -->
            <div class="card mb-4 bg-gradient-to-r from-primary to-primary-600 text-white p-6 rounded-2xl shadow-lg border-none">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                            <i class="pi pi-desktop text-3xl"></i>
                        </div>
                        <div>
                            <h1 class="text-2xl md:text-3xl font-extrabold tracking-wide m-0 text-white">
                                SGVTI &bull; MONITOR DE SALA DE ESPERA
                            </h1>
                            <p class="text-white/80 m-0 text-sm">Control de Turnos y Llamado a Salas en Tiempo Real</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-mono font-bold tracking-widest text-white drop-shadow">
                            {{ horaActual }}
                        </div>
                        <div class="text-xs uppercase tracking-wider text-white/80">
                            {{ fechaActual }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel Central: Turno Actual Llamado vs Cola de Espera -->
            <div class="grid grid-cols-12 gap-6 flex-grow">
                <!-- Turno Actual Destacado -->
                <div class="col-span-12 lg:col-span-8 flex flex-col">
                    <div class="card flex-grow flex flex-col justify-center items-center text-center p-8 bg-surface-0 dark:bg-surface-900 border-2 border-primary/30 rounded-2xl shadow-xl relative overflow-hidden">
                        
                        <!-- Etiqueta superior -->
                        <div class="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider mb-6 animate-pulse">
                            <i class="pi pi-volume-up"></i>
                            <span>TURNO LLAMADO AHORA</span>
                        </div>

                        <ng-container *ngIf="turnoActual; else noTurno">
                            <!-- Número de Turno Gigante -->
                            <div class="font-mono text-6xl sm:text-7xl md:text-8xl font-black text-primary tracking-tight mb-4 drop-shadow-sm">
                                {{ turnoActual.numeroTicket }}
                            </div>

                            <!-- Nombre del Visitante -->
                            <div class="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-0 mb-3">
                                {{ turnoActual.visitante.nombres }} {{ turnoActual.visitante.apellidos }}
                            </div>
                            <div class="text-sm text-muted-color mb-6 font-medium" *ngIf="turnoActual.visitante.empresa">
                                <i class="pi pi-briefcase mr-1"></i> {{ turnoActual.visitante.empresa }}
                            </div>

                            <!-- Destino: Sala a Dirigirse -->
                            <div class="w-full max-w-lg bg-surface-100 dark:bg-surface-800 p-5 rounded-2xl border border-surface-200 dark:border-surface-700">
                                <span class="text-xs uppercase font-semibold text-muted-color tracking-widest block mb-1">
                                    POR FAVOR DIRÍJASE A:
                                </span>
                                <div class="text-xl sm:text-2xl font-extrabold text-primary">
                                    {{ turnoActual.sala.nombre }}
                                </div>
                                <div class="text-sm font-medium text-surface-700 dark:text-surface-300 mt-1">
                                    {{ turnoActual.sala.piso }} &bull; Anfitrión: {{ turnoActual.anfitrion }}
                                </div>
                            </div>

                            <!-- Botón para volver a anunciar con audio -->
                            <div class="mt-6 flex gap-3">
                                <p-button 
                                    label="Repetir Llamado por Voz" 
                                    icon="pi pi-volume-up" 
                                    severity="primary" 
                                    [outlined]="true"
                                    (onClick)="anunciarVoz(turnoActual)" />
                                
                                <p-button 
                                    label="Marcar Ingreso" 
                                    icon="pi pi-check" 
                                    severity="success" 
                                    (onClick)="marcarIngresoActual()" />
                            </div>
                        </ng-container>

                        <ng-template #noTurno>
                            <div class="py-12">
                                <i class="pi pi-clock text-6xl text-muted-color/50 mb-4 block"></i>
                                <h3 class="text-2xl font-bold text-surface-800 dark:text-surface-200 m-0 mb-2">
                                    Esperando Siguiente Llamado
                                </h3>
                                <p class="text-muted-color max-w-md mx-auto">
                                    Por favor permanezca atento a la pantalla. En breve se anunciará su número de turno.
                                </p>
                                <div class="mt-6" *ngIf="proximosEnEspera.length > 0">
                                    <p-button 
                                        label="Llamar Siguiente en Cola ({{ proximosEnEspera[0].numeroTicket }})" 
                                        icon="pi pi-arrow-right" 
                                        severity="primary" 
                                        (onClick)="llamarSiguiente()" />
                                </div>
                            </div>
                        </ng-template>
                    </div>
                </div>

                <!-- Cola Lateral: Próximos en Espera -->
                <div class="col-span-12 lg:col-span-4 flex flex-col">
                    <div class="card flex-grow flex flex-col p-6 rounded-2xl shadow-lg">
                        <div class="flex items-center justify-between pb-3 mb-4 border-b border-surface-200 dark:border-surface-700">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-users text-primary text-xl"></i>
                                <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 m-0">En Espera ({{ proximosEnEspera.length }})</h3>
                            </div>
                            <span class="text-xs text-muted-color font-mono">Próximos Turnos</span>
                        </div>

                        <div class="flex-grow space-y-3 overflow-y-auto max-h-[500px]">
                            <div 
                                *ngFor="let item of proximosEnEspera; let i = index" 
                                class="p-3.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/60 flex items-center justify-between hover:border-primary/50 transition-colors">
                                
                                <div class="flex items-center gap-3">
                                    <span class="font-bold text-xs text-muted-color w-4 text-center">#{{ i + 1 }}</span>
                                    <div>
                                        <div class="font-mono font-bold text-lg text-primary">
                                            {{ item.numeroTicket }}
                                        </div>
                                        <div class="text-sm font-semibold text-surface-900 dark:text-surface-0">
                                            {{ item.visitante.nombres }} {{ item.visitante.apellidos }}
                                        </div>
                                        <div class="text-xs text-muted-color">
                                            {{ item.sala.nombre }}
                                        </div>
                                    </div>
                                </div>

                                <p-button 
                                    icon="pi pi-volume-up" 
                                    severity="info" 
                                    size="small" 
                                    [text]="true"
                                    (onClick)="llamarEste(item)" 
                                    pTooltip="Llamar este turno" />
                            </div>

                            <div *ngIf="proximosEnEspera.length === 0" class="text-center py-10 text-muted-color">
                                <i class="pi pi-check-circle text-3xl mb-2 text-emerald-500 block"></i>
                                <p class="text-sm m-0">No hay visitantes en espera en este momento.</p>
                            </div>
                        </div>

                        <!-- Footer con controles de voz -->
                        <div class="pt-4 mt-4 border-t border-surface-200 dark:border-surface-700 flex justify-between items-center text-xs text-muted-color">
                            <span>Voz sintética activa</span>
                            <span class="font-mono">{{ sgvtiService.solicitudesEnSala().length }} en salas ahora</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SgvtiPantallaTurnosComponent implements OnInit, OnDestroy {
    horaActual: string = '';
    fechaActual: string = '';
    private timerInterval: any;

    constructor(public sgvtiService: SgvtiService) {}

    ngOnInit(): void {
        this.actualizarReloj();
        this.timerInterval = setInterval(() => {
            this.actualizarReloj();
        }, 1000);
    }

    ngOnDestroy(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    get turnoActual(): SolicitudVisita | null {
        return this.sgvtiService.turnoActualLlamado();
    }

    get proximosEnEspera(): SolicitudVisita[] {
        return this.sgvtiService.solicitudesEnEspera().filter(s => s.id !== this.turnoActual?.id);
    }

    private actualizarReloj(): void {
        const ahora = new Date();
        this.horaActual = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.fechaActual = ahora.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    anunciarVoz(solicitud: SolicitudVisita): void {
        if ('speechSynthesis' in window) {
            const mensaje = `Turno ${solicitud.numeroTicket}. ${solicitud.visitante.nombres} ${solicitud.visitante.apellidos}, por favor dirigirse a ${solicitud.sala.nombre}.`;
            const utterance = new SpeechSynthesisUtterance(mensaje);
            utterance.lang = 'es-ES';
            utterance.rate = 0.95;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }

    llamarEste(solicitud: SolicitudVisita): void {
        this.sgvtiService.llamarTurno(solicitud.id);
        this.anunciarVoz(solicitud);
    }

    llamarSiguiente(): void {
        if (this.proximosEnEspera.length > 0) {
            this.llamarEste(this.proximosEnEspera[0]);
        }
    }

    marcarIngresoActual(): void {
        if (this.turnoActual) {
            this.sgvtiService.registrarIngresoSala(this.turnoActual.id);
        }
    }
}

