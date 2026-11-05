import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SolicitudVisita } from '../../models/sgvti.models';

@Component({
    selector: 'app-sgvti-ticket-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule],
    template: `
        <p-dialog 
            [(visible)]="visible" 
            [modal]="true" 
            [closable]="true"
            [style]="{ width: '450px', maxWidth: '95vw' }"
            [draggable]="false"
            [resizable]="false"
            (onHide)="onClose()"
            header="Comprobante de Turno / Ticket">
            
            <div *ngIf="solicitud" class="flex flex-col items-center">
                <!-- Contenedor Imprimible del Ticket -->
                <div id="sgvti-printable-ticket" class="ticket-container w-full bg-surface-0 dark:bg-surface-900 border-2 border-dashed border-primary/40 rounded-xl p-6 text-center shadow-lg">
                    
                    <!-- Encabezado -->
                    <div class="border-b border-dashed border-surface-300 dark:border-surface-700 pb-3 mb-4">
                        <div class="flex items-center justify-center gap-2 mb-1">
                            <i class="pi pi-shield text-primary text-2xl"></i>
                            <span class="text-xl font-bold tracking-wider text-surface-900 dark:text-surface-0">SGVTI</span>
                        </div>
                        <p class="text-xs uppercase tracking-widest text-muted-color m-0">Control de Accesos y Solicitudes</p>
                    </div>

                    <!-- Número de Ticket / Turno -->
                    <div class="my-4">
                        <span class="text-xs font-semibold uppercase text-muted-color block mb-1">Su Número de Turno</span>
                        <div class="ticket-number-badge font-mono">
                            {{ solicitud.numeroTicket }}
                        </div>
                        <div class="mt-2">
                            <span [ngClass]="{
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300': solicitud.prioridad === 'Normal',
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300': solicitud.prioridad === 'Preferencial',
                                'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300': solicitud.prioridad === 'Urgente'
                            }" class="text-xs font-medium px-2.5 py-0.5 rounded-full inline-block">
                                Prioridad: {{ solicitud.prioridad }}
                            </span>
                        </div>
                    </div>

                    <!-- Datos Principales de la Solicitud -->
                    <div class="text-left text-sm space-y-2 py-3 border-y border-dashed border-surface-300 dark:border-surface-700 my-4">
                        <div class="flex justify-between">
                            <span class="text-muted-color">Visitante:</span>
                            <span class="font-semibold text-surface-900 dark:text-surface-0 text-right">{{ solicitud.visitante.nombres }} {{ solicitud.visitante.apellidos }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-color">{{ solicitud.visitante.tipoDocumento }}:</span>
                            <span class="font-medium text-surface-800 dark:text-surface-100">{{ solicitud.visitante.documento }}</span>
                        </div>
                        <div class="flex justify-between" *ngIf="solicitud.visitante.empresa">
                            <span class="text-muted-color">Empresa:</span>
                            <span class="font-medium text-surface-800 dark:text-surface-100">{{ solicitud.visitante.empresa }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-color">Sala Destino:</span>
                            <span class="font-semibold text-primary text-right">{{ solicitud.sala.nombre }} ({{ solicitud.sala.piso }})</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-color">Anfitrión / Recibe:</span>
                            <span class="font-medium text-surface-800 dark:text-surface-100 text-right">{{ solicitud.anfitrion }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-color">Motivo:</span>
                            <span class="font-medium text-surface-800 dark:text-surface-100 text-right">{{ solicitud.motivo }}</span>
                        </div>
                        <div class="flex justify-between" *ngIf="solicitud.ingresaEquipo && solicitud.detalleEquipo">
                            <span class="text-muted-color">Equipos:</span>
                            <span class="font-medium text-amber-600 dark:text-amber-400 text-right text-xs max-w-[200px] truncate" [title]="solicitud.detalleEquipo">
                                {{ solicitud.detalleEquipo }}
                            </span>
                        </div>
                        <div class="flex justify-between text-xs text-muted-color pt-1 border-t border-surface-200 dark:border-surface-800">
                            <span>Fecha y Hora:</span>
                            <span>{{ solicitud.fechaHoraSolicitud }}</span>
                        </div>
                    </div>

                    <!-- Código QR Simulado -->
                    <div class="my-4 flex flex-col items-center justify-center">
                        <svg class="w-24 h-24 text-surface-900 dark:text-surface-100" viewBox="0 0 100 100" fill="currentColor">
                            <!-- Marco superior izquierdo -->
                            <rect x="10" y="10" width="28" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="6"/>
                            <rect x="18" y="18" width="12" height="12" rx="2" fill="currentColor"/>
                            <!-- Marco superior derecho -->
                            <rect x="62" y="10" width="28" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="6"/>
                            <rect x="70" y="18" width="12" height="12" rx="2" fill="currentColor"/>
                            <!-- Marco inferior izquierdo -->
                            <rect x="10" y="62" width="28" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="6"/>
                            <rect x="18" y="70" width="12" height="12" rx="2" fill="currentColor"/>
                            <!-- Puntos centrales y QR pattern -->
                            <rect x="44" y="12" width="10" height="8" fill="currentColor"/>
                            <rect x="46" y="26" width="8" height="12" fill="currentColor"/>
                            <rect x="12" y="44" width="8" height="10" fill="currentColor"/>
                            <rect x="26" y="46" width="12" height="8" fill="currentColor"/>
                            <rect x="45" y="45" width="10" height="10" rx="2" fill="currentColor"/>
                            <rect x="64" y="44" width="8" height="12" fill="currentColor"/>
                            <rect x="78" y="46" width="12" height="8" fill="currentColor"/>
                            <rect x="44" y="64" width="10" height="8" fill="currentColor"/>
                            <rect x="62" y="62" width="12" height="12" fill="currentColor"/>
                            <rect x="78" y="76" width="12" height="12" fill="currentColor"/>
                            <rect x="46" y="78" width="8" height="12" fill="currentColor"/>
                        </svg>
                        <span class="text-[10px] text-muted-color tracking-widest mt-1 uppercase font-mono">
                            {{ solicitud.numeroTicket }} | {{ solicitud.id }}
                        </span>
                    </div>

                    <!-- Mensaje al pie -->
                    <p class="text-xs text-muted-color italic m-0 pt-2 border-t border-dashed border-surface-300 dark:border-surface-700">
                        Por favor tome asiento en recepción y espere su llamado en pantalla. Conserve este comprobante hasta finalizar su visita.
                    </p>
                </div>
            </div>

            <!-- Footer / Acciones (No imprimible) -->
            <ng-template #footer>
                <div class="flex justify-between items-center w-full no-print pt-2">
                    <p-button 
                        label="Cerrar" 
                        icon="pi pi-times" 
                        severity="secondary" 
                        [outlined]="true" 
                        (onClick)="onClose()" />
                    
                    <div class="flex gap-2">
                        <p-button 
                            *ngIf="showNuevaBtn" 
                            label="Nueva Solicitud" 
                            icon="pi pi-plus" 
                            severity="info" 
                            [outlined]="true"
                            (onClick)="onNueva()" />
                        <p-button 
                            label="Imprimir Ticket" 
                            icon="pi pi-print" 
                            severity="primary" 
                            (onClick)="imprimirTicket()" />
                    </div>
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class SgvtiTicketDialogComponent {
    @Input() visible: boolean = false;
    @Input() solicitud: SolicitudVisita | null = null;
    @Input() showNuevaBtn: boolean = true;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() nuevaSolicitud = new EventEmitter<void>();

    onClose(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onNueva(): void {
        this.onClose();
        this.nuevaSolicitud.emit();
    }

    imprimirTicket(): void {
        window.print();
    }
}

