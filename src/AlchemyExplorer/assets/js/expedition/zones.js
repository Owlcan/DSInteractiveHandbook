// Zone Patrol zone registry (global, no modules)
(function () {
    const ZONES = {
        'lissome-plains': {
            id: 'lissome-plains',
            displayName: 'Lissome Plains',
            logbookLocationId: 'lissome-plains',
            logbookLocationName: 'Lissome Plains'
        },
        'greensea-expanse': {
            id: 'greensea-expanse',
            displayName: 'Greensea Expanse',
            logbookLocationId: 'greensea-expanse',
            logbookLocationName: 'Greensea Expanse'
        }
    };

    function getZoneConfig(zoneId) {
        const id = (zoneId && typeof zoneId === 'string') ? zoneId : 'lissome-plains';
        return ZONES[id] || ZONES['lissome-plains'];
    }

    window.ZonePatrolZones = {
        getZoneConfig,
        ZONES
    };
})();
