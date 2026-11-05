import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { SgvtiService } from '../services/sgvti.service';
import { Sala, SolicitudVisita } from '../models/sgvti.models';

@Component({
    selector: 'app-sgvti-salas',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule
    ],
    template: `
        <div class="card">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-building text-primary text-2xl"></i>
                        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">Salas y Espacios Institucionales</h1>
                    </div>
                    <p class="text-muted-color m-0 text-sm">
                        Monitoreo del aforo, disponibilidad y visitantes en salas y oficinas en tiempo real.
                    </p>
                </div>
                <div>
                    <p-button 
                        label="Nueva Sala" 
                        icon="pi pi-plus" 
                        severity="primary" 
                        (onClick)="modalVisible = true" />
                </div>
            </div>

            <!-- Grid de Salas -->
            <div class="grid grid-cols-12 gap-6">
                <div *ngFor="let sala of sgvtiService.salas()" class="col-span-12 md:col-span-6 xl:col-span-4">
                    <div class="border border-surface-200 dark:border-surface-700 rounded-2xl p-5 bg-surface-0 dark:bg-surface-900 shadow-sm flex flex-col justify-between h-full hover:border-primary/50 transition-all">
                        
                        <div>
                            <!-- Header de la tarjeta -->
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <span class="text-xs font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                                        {{ sala.codigo }}
                                    </span>
                                    <h3 class="text-lg font-bold text-surface-900 dark:text-surface-0 mt-2 mb-1">
                                        {{ sala.nombre }}
                                    </h3>
                                    <span class="text-xs text-muted-color flex items-center gap-1">
                                        <i class="pi pi-map-marker text-[10px]"></i> {{ sala.piso }}
                                    </span>
                                </div>
                                <p-tag 
                                    [value]="sala.ocupados >= sala.capacidad ? 'Llena' : (sala.ocupados > 0 ? 'Ocupada' : 'Disponible')" 
                                    [severity]="sala.ocupados >= sala.capacidad ? 'danger' : (sala.ocupados > 0 ? 'warn' : 'success')" />
                            </div>

                            <!-- Descripción -->
                            <p class="text-xs text-muted-color mb-4 line-clamp-2">
                                {{ sala.descripcion || 'Sin descripción disponible.' }}
                            </p>

                            <!-- Barra de Aforo / Ocupación -->
                            <div class="bg-surface-50 dark:bg-surface-800 p-3 rounded-xl border border-surface-100 dark:border-surface-700/60 mb-4">
                                <div class="flex justify-between items-center text-xs font-medium mb-1.5">
                                    <span class="text-muted-color">Ocupación Actual:</span>
                                    <span class="font-bold text-surface-900 dark:text-surface-0">
                                        {{ sala.ocupados }} / {{ sala.capacidad }} personas
                                    </span>
                                </div>
                                <div class="w-full bg-surface-200 dark:bg-surface-700 h-2 rounded-full overflow-hidden">
                                    <div 
                                        class="h-full rounded-full transition-all"
                                        [ngClass]="{
                                            'bg-emerald-500': (sala.ocupados / sala.capacidad) < 0.6,
                                            'bg-amber-500': (sala.ocupados / sala.capacidad) >= 0.6 && (sala.ocupados / sala.capacidad) < 1,
                                            'bg-red-500': (sala.ocupados / sala.capacidad) >= 1
                                        }"
                                        [style.width.%]="(sala.ocupados / sala.capacidad) * 100">
                                    </div>
                                </div>
                            </div>

                            <!-- Responsable -->
                            <div class="text-xs text-surface-700 dark:text-surface-300 flex items-center gap-1.5 mb-3">
                                <i class="pi pi-user text-muted-color text-[11px]"></i>
                                <span><strong>Responsable:</strong> {{ sala.responsable || 'No asignado' }}</span>
                            </div>
                        </div>

                        <!-- Visitantes actualmente en sala -->
                        <div class="border-t border-surface-100 dark:border-surface-800 pt-3">
                            <span class="text-[11px] font-semibold text-muted-color uppercase block mb-1.5">
                                Visitas activas en sala:
                            </span>
                            <div *ngIf="getVisitantesEnSala(sala.id).length > 0; else sinVisitas" class="space-y-1">
                                <div *ngFor="let visita of getVisitantesEnSala(sala.id)" class="text-xs flex justify-between items-center bg-surface-50 dark:bg-surface-800/40 p-1.5 rounded">
                                    <span class="font-medium text-surface-800 dark:text-surface-200 truncate">
                                        {{ visita.visitante.nombres }} {{ visita.visitante.apellidos }}
                                    </span>
                                    <span class="font-mono text-[10px] text-primary font-bold">
                                        {{ visita.numeroTicket }}
                                    </span>
                                </div>
                            </div>
                            <ng-template #sinVisitas>
                                <span class="text-xs text-muted-color italic">No hay visitantes dentro en este momento.</span>
                            </ng-template>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Diálogo para Agregar Sala -->
        <p-dialog 
            [(visible)]="modalVisible" 
            [modal]="true" 
            [style]="{ width: '480px', maxWidth: '95vw' }"
            header="Registrar Nueva Sala o Espacio"
            [draggable]="false">
            
            <div class="grid grid-cols-12 gap-3 pt-2">
                <div class="col-span-12 sm:col-span-4">
                    <label class="block text-sm font-medium mb-1">Código *</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="nuevaSala.codigo" 
                        placeholder="Ej: SALA-06" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-8">
                    <label class="block text-sm font-medium mb-1">Nombre de la Sala *</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="nuevaSala.nombre" 
                        placeholder="Nombre descriptivo" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-8">
                    <label class="block text-sm font-medium mb-1">Piso / Ubicación *</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="nuevaSala.piso" 
                        placeholder="Ej: Piso 2 - Ala Norte" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-4">
                    <label class="block text-sm font-medium mb-1">Capacidad *</label>
                    <input 
                        pInputText 
                        type="number" 
                        [(ngModel)]="nuevaSala.capacidad" 
                        placeholder="8" 
                        class="w-full" />
                </div>

                <div class="col-span-12">
                    <label class="block text-sm font-medium mb-1">Responsable / Encargado</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="nuevaSala.responsable" 
                        placeholder="Nombre y cargo del responsable" 
                        class="w-full" />
                </div>

                <div class="col-span-12">
                    <label class="block text-sm font-medium mb-1">Descripción</label>
                    <textarea 
                        pTextarea 
                        rows="2" 
                        [(ngModel)]="nuevaSala.descripcion" 
                        placeholder="Detalles del equipamiento y uso de la sala..." 
                        class="w-full"></textarea>
                </div>
            </div>

            <ng-template #footer>
                <div class="flex justify-end gap-2 pt-3">
                    <p-button 
                        label="Cancelar" 
                        icon="pi pi-times" 
                        severity="secondary" 
                        [text]="true" 
                        (onClick)="modalVisible = false" />
                    <p-button 
                        label="Guardar Sala" 
                        icon="pi pi-check" 
                        severity="primary" 
                        (onClick)="guardarSala()" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class SgvtiSalasComponent implements OnInit {
    modalVisible: boolean = false;

    nuevaSala = {
        codigo: '',
        nombre: '',
        piso: '',
        capacidad: 10,
        responsable: '',
        descripcion: '',
        estado: 'Disponible' as const
    };

    constructor(
        public sgvtiService: SgvtiService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {}

    getVisitantesEnSala(salaId: string): SolicitudVisita[] {
        return this.sgvtiService.solicitudes().filter(s => s.salaId === salaId && s.estado === 'En Sala');
    }

    guardarSala(): void {
        if (!this.nuevaSala.codigo.trim() || !this.nuevaSala.nombre.trim() || !this.nuevaSala.piso.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Campos requeridos', detail: 'Por favor complete código, nombre y piso.' });
            return;
        }

        this.sgvtiService.crearSala({
            codigo: this.nuevaSala.codigo.toUpperCase(),
            nombre: this.nuevaSala.nombre,
            piso: this.nuevaSala.piso,
            capacidad: Number(this.nuevaSala.capacidad) || 10,
            responsable: this.nuevaSala.responsable,
            descripcion: this.nuevaSala.descripcion,
            estado: 'Disponible'
        });

        this.messageService.add({ severity: 'success', summary: 'Sala Creada', detail: 'La nueva sala se ha registrado correctamente.' });
        this.modalVisible = false;
        this.nuevaSala = {
            codigo: '',
            nombre: '',
            piso: '',
            capacidad: 10,
            responsable: '',
            descripcion: '',
            estado: 'Disponible'
        };
    }
}

