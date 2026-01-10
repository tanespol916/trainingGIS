import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page').then(m => m.HomePage)
    },
    {
        path: 'about',
        loadComponent: () => import('./pages/about-page/about-page').then(m => m.AboutPage)
    },
    {
        path: 'article',
        loadComponent: () => import('./pages/article-page/article-page').then(m => m.ArticlePage)
    },
    {
        path: 'project',
        loadComponent: () => import('./pages/project-page/project-page').then(m => m.ProjectPage)
    },
    {
        path: 'speaking',
        loadComponent: () => import('./pages/speaking-page/speaking-page').then(m => m.SpeakingPage)
    },
    {
        path: 'uses',
        loadComponent: () => import('./pages/uses-page/uses-page').then(m => m.UsesPage)
    },
];
