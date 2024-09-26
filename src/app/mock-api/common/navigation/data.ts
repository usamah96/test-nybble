/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/dashboard',
    },
    {
        id: 'invoices',
        title: 'Invoices',
        type: 'group',
        icon: 'heroicons_outline:rectangle-stack',
        children: [
            {
                id: 'invoices.all',
                title: 'All Invoices',
                type: 'basic',
            },
            {
                id: 'invoices.outstanding',
                title: 'Invoices Outstanding',
                type: 'basic',
            },
            {
                id: 'invoices.paid',
                title: 'Invoices Paid',
                type: 'basic',
            },
            {
                id: 'invoices.queried',
                title: 'Invoices Queried',
                type: 'basic',
            },
        ],
    },
    {
        id: 'messages',
        title: 'Messages',
        type: 'group',
        icon: 'heroicons_outline:envelope',
        children: [
            {
                id: 'messages.received',
                title: 'Messages Received',
                type: 'basic',
            },
            {
                id: 'messages.sent',
                title: 'Messsages Sent',
                type: 'basic',
            },
        ],
    },
    {
        id: 'mot',
        title: 'MOT History And Road Tax',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        tooltip: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/dashboard',
    },
    {
        id: 'invoices',
        title: 'Invoices',
        tooltip: 'Invoices',
        type: 'group',
        icon: 'heroicons_outline:rectangle-stack',
        children: [],
    },
    {
        id: 'messages',
        title: 'Messages',
        tooltip: 'Messages',
        type: 'group',
        icon: 'heroicons_outline:envelope',
        children: [],
    },
    {
        id: 'mot',
        title: 'MOT History And Road Tax',
        tooltip: 'MOT History And Road Tax',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        tooltip: 'Dashboard',
        type: 'basic',
        link: '/dashboard',
    },
    {
        id: 'invoices',
        title: 'Invoices',
        type: 'group',
        children: [],
    },
    {
        id: 'messages',
        title: 'Messages',
        type: 'group',
        children: [],
    },
    {
        id: 'mot',
        title: 'MOT History And Road Tax',
        tooltip: 'MOT History And Road Tax',
        type: 'basic',
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        tooltip: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/dashboard',
    },
    {
        id: 'invoices',
        title: 'Invoices',
        tooltip: 'Invoices',
        type: 'group',
        icon: 'heroicons_outline:rectangle-stack',
        children: [],
    },
    {
        id: 'messages',
        title: 'Messages',
        tooltip: 'Messages',
        type: 'group',
        icon: 'heroicons_outline:envelope',
        children: [],
    },
    {
        id: 'mot',
        title: 'MOT History And Road Tax',
        tooltip: 'MOT History And Road Tax',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
    },
];
