import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-sgvti-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, CheckboxModule],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden p-4">
            <div class="flex flex-col items-center justify-center w-full max-w-md">
                
                <!-- Logo & Brand Header -->
                <div class="flex items-center gap-2 mb-6">
                    <div class="bg-primary text-white p-3 rounded-2xl shadow-md">
                        <i class="pi pi-shield text-3xl"></i>
                    </div>
                    <div>
                        <span class="text-3xl font-extrabold text-surface-900 dark:text-surface-0 tracking-wider">SGVTI</span>
                        <span class="block text-xs uppercase tracking-widest text-primary font-bold">Control de Solicitudes y Acceso</span>
                    </div>
                </div>

                <!-- Tarjeta de Login -->
                <div class="w-full bg-surface-0 dark:bg-surface-900 p-8 rounded-3xl shadow-xl border border-surface-200 dark:border-surface-800">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 m-0">Iniciar Sesión</h2>
                        <p class="text-muted-color text-sm mt-1 mb-0">Ingrese sus credenciales de recepcionista o administrador</p>
                    </div>

                    <form (ngSubmit)="onLogin()" class="space-y-4">
                        <div>
                            <label for="username" class="block text-surface-900 dark:text-surface-0 font-medium text-sm mb-2">Usuario o Correo</label>
                            <input 
                                id="username" 
                                type="text" 
                                pInputText 
                                [(ngModel)]="username" 
                                name="username"
                                placeholder="admin" 
                                class="w-full" />
                        </div>

                        <div>
                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-sm mb-2">Contraseña</label>
                            <p-password 
                                id="password" 
                                [(ngModel)]="password" 
                                name="password"
                                [feedback]="false" 
                                [toggleMask]="true" 
                                placeholder="••••••••" 
                                styleClass="w-full" 
                                inputStyleClass="w-full"></p-password>
                        </div>

                        <div class="flex items-center justify-between text-sm pt-1">
                            <div class="flex items-center gap-2">
                                <p-checkbox id="rememberme" [(ngModel)]="checked" [binary]="true" name="rememberme"></p-checkbox>
                                <label for="rememberme" class="text-surface-700 dark:text-surface-300 cursor-pointer">Recordarme</label>
                            </div>
                            <a class="font-medium text-primary hover:underline cursor-pointer">¿Olvidó su contraseña?</a>
                        </div>

                        <p-button 
                            type="submit" 
                            label="Ingresar al Sistema" 
                            icon="pi pi-sign-in" 
                            severity="primary" 
                            styleClass="w-full font-bold py-3 mt-2 shadow" />
                    </form>

                    <!-- Acceso Rápido Demo -->
                    <div class="mt-6 pt-5 border-t border-surface-100 dark:border-surface-800 text-center">
                        <span class="text-xs text-muted-color block mb-2">Credenciales demostrativas:</span>
                        <div class="inline-flex items-center gap-2 bg-surface-100 dark:bg-surface-800 px-3 py-1.5 rounded-lg text-xs font-mono text-surface-700 dark:text-surface-300">
                            <span>Usuario: <strong>admin</strong></span>
                            <span>&bull;</span>
                            <span>Clave: <strong>123456</strong></span>
                        </div>
                        <div class="mt-3">
                            <button 
                                type="button" 
                                (click)="loginDemo()" 
                                class="text-xs text-primary font-semibold hover:underline bg-transparent border-none cursor-pointer">
                                Autocompletar e ingresar directamente &rarr;
                            </button>
                        </div>
                    </div>
                </div>

                <div class="text-center mt-6 text-xs text-muted-color">
                    &copy; 2026 SGVTI &bull; Desarrollado con Angular & Sakai PrimeNG
                </div>
            </div>
        </div>
    `
})
export class SgvtiLoginComponent {
    username: string = 'admin';
    password: string = '123456';
    checked: boolean = true;

    constructor(private router: Router) {}

    onLogin() {
        if (this.username && this.password) {
            this.router.navigate(['/sgvti/dashboard']);
        }
    }

    loginDemo() {
        this.username = 'admin';
        this.password = '123456';
        this.router.navigate(['/sgvti/dashboard']);
    }
}
