import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Recepción & Visitas',
                items: [
                    { label: 'Panel Principal', icon: 'pi pi-fw pi-home', routerLink: ['/sgvti/dashboard'] },
                    { label: 'Nueva Solicitud (Ticket)', icon: 'pi pi-fw pi-ticket', routerLink: ['/sgvti/solicitudes/nueva'] },
                    { label: 'Control de Solicitudes', icon: 'pi pi-fw pi-list-check', routerLink: ['/sgvti/solicitudes'] },
                    { label: 'Monitor de Turnos (TV)', icon: 'pi pi-fw pi-desktop', routerLink: ['/sgvti/turnos'] }
                ]
            },
            {
                label: 'Gestión & Catálogos',
                items: [
                    { label: 'Directorio de Visitantes', icon: 'pi pi-fw pi-address-book', routerLink: ['/sgvti/visitantes'] },
                    { label: 'Salas & Espacios', icon: 'pi pi-fw pi-building', routerLink: ['/sgvti/salas'] }
                ]
            },
            {
                label: 'Cuenta & Sesión',
                items: [
                    { label: 'Cerrar Sesión', icon: 'pi pi-fw pi-sign-out', routerLink: ['/sgvti/login'] }
                ]
            }
        ];
    }
}
