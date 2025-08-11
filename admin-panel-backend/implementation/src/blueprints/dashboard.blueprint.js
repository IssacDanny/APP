export default {
    resource: {
        name: 'dashboard',
        prefix: '/dashboard',
    },

    uiSchema: {
        title: 'Dashboard',
        icon: 'layout', // Example icon
        items: [
        {
            type: 'resource',
            id: 'main-dashboard',
            name: 'Overview',
            icon: 'home',
            endpoint: '/dashboard',
            views: {
            // A real dashboard would have a custom view type,
            // but for now, we can use a placeholder.
            listView: {
                columns: [{ field: 'message', header: 'Welcome' }],
            },
            },
        },
        ],
    },

    routes: [
        {
            path: '/',
            method: 'GET',
            handler: 'dashboardService.get',
            interceptors: [
                'authentication',
                { name: 'featureFlag', options: { flagName: 'beta-dashboard' } }
            ]
        }
    ]
}