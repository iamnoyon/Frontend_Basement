export const breadcrumbData = [
    {
        route: '/user-management/users',
        items: [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'User List', url: '#' },
        ]
    },
    {
        route: '/user-management/users/create',
         items: [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'User List', url: '/user-management/users' },
            { label: 'Create', url: '#' },
        ]
    },
     {
        route: '/user-management/users/edit/[id]',
         items: [
            { label: 'Dashboard', url: '/dashboard' },
            { label: 'User List', url: '/user-management/users' },
            { label: 'Edit', url: '#' },
        ]
    }
]