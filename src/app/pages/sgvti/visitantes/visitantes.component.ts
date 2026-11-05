import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { SgvtiService } from '../services/sgvti.service';
import { Visitante, TipoDocumento } from '../models/sgvti.models';

@Component({
    selector: 'app-sgvti-visitantes',
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
        DialogModule,
        SelectModule
    ],
    template: `
        <div class="card">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <i class="pi pi-address-book text-primary text-2xl"></i>
                        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">Directorio de Visitantes</h1>
                    </div>
                    <p class="text-muted-color m-0 text-sm">
                        Base de datos centralizada de personas, proveedores y contratistas registrados en el sistema.
                    </p>
                </div>
                <div class="flex gap-2">
                    <p-button 
                        label="Registrar Visitante" 
                        icon="pi pi-user-plus" 
                        severity="primary" 
                        (onClick)="abrirModalNuevo()" />
                    <p-button 
                        label="Nueva Solicitud" 
                        icon="pi pi-ticket" 
                        severity="secondary" 
                        [outlined]="true" 
                        routerLink="/sgvti/solicitudes/nueva" />
                </div>
            </div>

            <p-table 
                #dt 
                [value]="sgvtiService.visitantes()" 
                [paginator]="true" 
                [rows]="10" 
                [rowsPerPageOptions]="[10, 25, 50]"
                [globalFilterFields]="['documento', 'nombres', 'apellidos', 'empresa', 'telefono', 'email']"
                responsiveLayout="scroll"
                styleClass="p-datatable-striped">
                
                <ng-template #caption>
                    <div class="flex items-center justify-between flex-wrap gap-3">
                        <span class="text-lg font-semibold text-surface-900 dark:text-surface-0">
                            Visitantes Registrados ({{ sgvtiService.visitantes().length }})
                        </span>
                        <div class="flex items-center gap-2">
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search" />
                                <input 
                                    pInputText 
                                    type="text" 
                                    (input)="onGlobalFilter(dt, $event)" 
                                    placeholder="Buscar por cédula, nombre..." 
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
                        <th pSortableColumn="documento" style="min-width: 10rem">
                            Documento <p-sortIcon field="documento" />
                        </th>
                        <th pSortableColumn="nombres" style="min-width: 14rem">
                            Nombres y Apellidos <p-sortIcon field="nombres" />
                        </th>
                        <th pSortableColumn="empresa" style="min-width: 12rem">
                            Empresa / Procedencia <p-sortIcon field="empresa" />
                        </th>
                        <th style="min-width: 12rem">Contacto</th>
                        <th pSortableColumn="totalVisitas" style="min-width: 8rem; text-align: center">
                            Visitas <p-sortIcon field="totalVisitas" />
                        </th>
                        <th pSortableColumn="estado" style="min-width: 8rem">
                            Estado <p-sortIcon field="estado" />
                        </th>
                        <th style="min-width: 10rem; text-align: center">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template #body let-visitante>
                    <tr>
                        <td>
                            <div class="font-mono font-semibold text-surface-900 dark:text-surface-0">{{ visitante.documento }}</div>
                            <div class="text-xs text-muted-color">{{ visitante.tipoDocumento }}</div>
                        </td>
                        <td>
                            <div class="font-semibold text-surface-900 dark:text-surface-0">{{ visitante.nombres }} {{ visitante.apellidos }}</div>
                            <div class="text-xs text-muted-color" *ngIf="visitante.cargo">{{ visitante.cargo }}</div>
                        </td>
                        <td>
                            <div class="text-sm font-medium">{{ visitante.empresa || 'Particular' }}</div>
                        </td>
                        <td>
                            <div class="text-xs font-medium text-surface-800 dark:text-surface-200">
                                <i class="pi pi-phone text-[10px] mr-1"></i>{{ visitante.telefono }}
                            </div>
                            <div class="text-xs text-muted-color" *ngIf="visitante.email">
                                <i class="pi pi-envelope text-[10px] mr-1"></i>{{ visitante.email }}
                            </div>
                        </td>
                        <td class="text-center">
                            <span class="inline-flex items-center justify-center font-bold text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                                {{ visitante.totalVisitas }}
                            </span>
                        </td>
                        <td>
                            <p-tag 
                                [value]="visitante.estado" 
                                [severity]="visitante.estado === 'Activo' ? 'success' : 'danger'" />
                        </td>
                        <td class="text-center">
                            <div class="flex items-center justify-center gap-1">
                                <p-button 
                                    icon="pi pi-pencil" 
                                    severity="secondary" 
                                    size="small" 
                                    [outlined]="true"
                                    (onClick)="abrirModalEditar(visitante)" 
                                    pTooltip="Editar Datos" />
                                <p-button 
                                    icon="pi pi-ticket" 
                                    severity="primary" 
                                    size="small" 
                                    (onClick)="crearSolicitudParaVisitante(visitante)" 
                                    pTooltip="Crear Solicitud / Ticket" />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template #emptymessage>
                    <tr>
                        <td colspan="7" class="text-center p-6 text-muted-color">
                            No se encontraron visitantes en el directorio.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Diálogo para Crear / Editar Visitante -->
        <p-dialog 
            [(visible)]="modalVisible" 
            [modal]="true" 
            [style]="{ width: '500px', maxWidth: '95vw' }"
            [header]="esEdicion ? 'Editar Visitante' : 'Nuevo Visitante'"
            [draggable]="false">
            
            <div class="grid grid-cols-12 gap-3 pt-2">
                <div class="col-span-12 sm:col-span-4">
                    <label class="block text-sm font-medium mb-1">Tipo Doc. *</label>
                    <p-select 
                        [options]="tiposDocumento" 
                        [(ngModel)]="form.tipoDocumento" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-8">
                    <label class="block text-sm font-medium mb-1">Documento *</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="form.documento" 
                        placeholder="Número de cédula o DNI" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-6">
                    <label class="block text-sm font-medium mb-1">Nombres *</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="form.nombres" 
                        placeholder="Nombres" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-6">
                    <label class="block text-sm font-medium mb-1">Apellidos *</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="form.apellidos" 
                        placeholder="Apellidos" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-6">
                    <label class="block text-sm font-medium mb-1">Teléfono *</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="form.telefono" 
                        placeholder="Teléfono móvil" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-6">
                    <label class="block text-sm font-medium mb-1">Correo Electrónico</label>
                    <input 
                        pInputText 
                        type="email" 
                        [(ngModel)]="form.email" 
                        placeholder="correo@ejemplo.com" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-6">
                    <label class="block text-sm font-medium mb-1">Empresa / Procedencia</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="form.empresa" 
                        placeholder="Empresa u origen" 
                        class="w-full" />
                </div>

                <div class="col-span-12 sm:col-span-6">
                    <label class="block text-sm font-medium mb-1">Cargo</label>
                    <input 
                        pInputText 
                        type="text" 
                        [(ngModel)]="form.cargo" 
                        placeholder="Ej: Auditor, Técnico" 
                        class="w-full" />
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
                        [label]="esEdicion ? 'Actualizar' : 'Guardar Visitante'" 
                        icon="pi pi-check" 
                        severity="primary" 
                        (onClick)="guardarVisitante()" />
                </div>
            </ng-template>
        </p-dialog>
    `
})
export class SgvtiVisitantesComponent implements OnInit {
    modalVisible: boolean = false;
    esEdicion: boolean = false;
    visitanteActualId: string = '';

    tiposDocumento: TipoDocumento[] = ['Cédula', 'DNI', 'Pasaporte', 'RUT', 'Otro'];

    form = {
        tipoDocumento: 'Cédula' as TipoDocumento,
        documento: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        empresa: '',
        cargo: ''
    };

    constructor(
        public sgvtiService: SgvtiService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {}

    onGlobalFilter(table: any, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    abrirModalNuevo(): void {
        this.esEdicion = false;
        this.visitanteActualId = '';
        this.form = {
            tipoDocumento: 'Cédula',
            documento: '',
            nombres: '',
            apellidos: '',
            telefono: '',
            email: '',
            empresa: '',
            cargo: ''
        };
        this.modalVisible = true;
    }

    abrirModalEditar(visitante: Visitante): void {
        this.esEdicion = true;
        this.visitanteActualId = visitante.id;
        this.form = {
            tipoDocumento: visitante.tipoDocumento,
            documento: visitante.documento,
            nombres: visitante.nombres,
            apellidos: visitante.apellidos,
            telefono: visitante.telefono,
            email: visitante.email,
            empresa: visitante.empresa,
            cargo: visitante.cargo || ''
        };
        this.modalVisible = true;
    }

    guardarVisitante(): void {
        if (!this.form.documento.trim() || !this.form.nombres.trim() || !this.form.apellidos.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Campos requeridos', detail: 'Por favor complete documento, nombres y apellidos.' });
            return;
        }

        if (this.esEdicion) {
            const existente = this.sgvtiService.visitantes().find(v => v.id === this.visitanteActualId);
            if (existente) {
                this.sgvtiService.actualizarVisitante({
                    ...existente,
                    tipoDocumento: this.form.tipoDocumento,
                    documento: this.form.documento,
                    nombres: this.form.nombres,
                    apellidos: this.form.apellidos,
                    telefono: this.form.telefono,
                    email: this.form.email,
                    empresa: this.form.empresa,
                    cargo: this.form.cargo
                });
                this.messageService.add({ severity: 'success', summary: 'Visitante Actualizado', detail: 'Los datos fueron actualizados correctamente.' });
            }
        } else {
            this.sgvtiService.crearVisitante({
                tipoDocumento: this.form.tipoDocumento,
                documento: this.form.documento,
                nombres: this.form.nombres,
                apellidos: this.form.apellidos,
                telefono: this.form.telefono,
                email: this.form.email,
                empresa: this.form.empresa || 'Particular',
                cargo: this.form.cargo,
                estado: 'Activo'
            });
            this.messageService.add({ severity: 'success', summary: 'Visitante Creado', detail: 'El visitante fue registrado exitosamente.' });
        }

        this.modalVisible = false;
    }

    crearSolicitudParaVisitante(visitante: Visitante): void {
        this.router.navigate(['/sgvti/solicitudes/nueva']);
    }
}

