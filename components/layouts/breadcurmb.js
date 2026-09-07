export const breadcrumbData = [
    {
        route: '/user-management/users',
        items: [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'User', url: '#' },
            { label: 'List', url: '#' },
        ]
    },
    {
        route: '/user-management/users/create',
         items: [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'User', url: '#' },
            { label: 'Create', url: '#' },
        ]
    },
     {
        route: '/user-management/users/edit/[id]',
         items: [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'User', url: '#' },
            { label: 'Edit', url: '#' },
        ]
    }
]