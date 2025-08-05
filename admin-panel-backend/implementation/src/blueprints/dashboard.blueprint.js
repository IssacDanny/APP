export default {
    resource: {
        name: 'dashboard',
        prefix: '/dashboard',
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