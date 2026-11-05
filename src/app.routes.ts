import { Routes } from '@angular/router';
import { SgvtiLoginComponent } from './app/pages/sgvti/auth/login.component';
import { SgvtiDashboardComponent } from './app/pages/sgvti/dashboard/dashboard.component';
import { SgvtiNuevaSolicitudComponent } from './app/pages/sgvti/solicitudes/nueva-solicitud.component';
import { SgvtiControlSolicitudesComponent } from './app/pages/sgvti/solicitudes/control-solicitudes.component';
import { SgvtiPantallaTurnosComponent } from './app/pages/sgvti/turnos/pantalla-turnos.component';
import { SgvtiVisitantesComponent } from './app/pages/sgvti/visitantes/visitantes.component';
import { SgvtiSalasComponent } from './app/pages/sgvti/salas/salas.component';
import { AppLayout } from './app/layout/component/app.layout';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    { path: '', redirectTo: 'sgvti/login', pathMatch: 'full' },
    { path: 'sgvti/login', component: SgvtiLoginComponent },
    { 
        path: 'sgvti', 
        component: AppLayout,
        children: [
            { path: 'dashboard', component: SgvtiDashboardComponent },
            { path: 'solicitudes/nueva', component: SgvtiNuevaSolicitudComponent },
            { path: 'solicitudes', component: SgvtiControlSolicitudesComponent },
            { path: 'turnos', component: SgvtiPantallaTurnosComponent },
            { path: 'visitantes', component: SgvtiVisitantesComponent },
            { path: 'salas', component: SgvtiSalasComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', component: Notfound }
];
