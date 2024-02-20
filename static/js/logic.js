function createMap(earthquakeLocation) {

    // Adding the tile layer
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // baseMaps object to hold the streetmap layer
    let baseMaps = {
        "Street Map": streetmap
    };

    // overlayMaps object to hold the earthquake layer
    let overlayMaps = {
        "Earthquake Location": earthquakeLocation
    };

    // crate a map object
    let map = L.map("map", {
        center: [39.7392, -105],
        zoom: 4.5,
        layers: [streetmap, earthquakeLocation]
    });

    // layer control, pass it baseMaps and overlayMaps.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    var legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            depths = [-10, 10, 30, 50, 70, 90],
            labels = [];
    
        // Loop through depth intervals and generate legend items
        for (var i = 0; i < depths.length; i++) {
            // Get the color corresponding to the depth
            var color = getColor(depths[i] + 1);
    
            // Create a colored square using CSS and include it in the legend item
            div.innerHTML +=
                '<div style="display:inline-block;width:20px;height:20px;background-color:' + color + ';margin-right:5px;"></div>' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
    
        // Apply CSS styling to create a box around the legend
        div.style.padding = '10px';
        div.style.backgroundColor = 'white';
        div.style.border = '1px solid #ccc';
    
        return div;
    };
    
    
    legend.addTo(map);

};

// url for all earthquake data from past 7 days
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get the data with d3.
d3.json(earthquakeUrl).then(function(response) {
    // Create a geoJson layer with response from earthquakeUrl.
    // L.geoJson(response).addTo(map);

    let earthquakeData = response;

    plotEarthquakes(earthquakeData);

});

// Define getColor function to map depth values to colors
function getColor(depth) {
    if (depth < 10) {
        return "greenyellow";
    } else if (depth < 30) {
        return "lawngreen";
    } else if (depth < 50) {
        return "gold";
    } else if (depth < 70) {
        return "red";
    } else if (depth < 90) {
        return "darkred";
    } else {
        return "maroon";
    }
};

// create function to place cirlces on map for earthquakes
function plotEarthquakes(data) {
    let earthquakeFeatures = data.features;
    // initialize array to hold earthquake markers
    let markers = [];

    // Loop through each feature to access its geometry
    earthquakeFeatures.forEach(function(feature) {
        // Access the geometry of the current feature
        let geometry = feature.geometry;

        // Extract coordinates from the geometry
        let coordinates = geometry.coordinates;
        let lat = coordinates[1];
        let lng = coordinates[0];
        let depth = coordinates[2];

        let magnitude = feature.properties.mag;
        let radius = Math.pow(magnitude, 2) * 3000;
        // let radius = Math.pow(10, magnitude) * 3;
        // let radius = magnitude * 3;
     
        let color = getColor(depth);

        // Create a circle at the earthquake's coordinates with radius
        let marker = L.circle([lat, lng], {
            radius: radius,
            color: "Black",
            weight: 0.5,
            fillColor: color,
            fillOpacity: 0.5
        });
        
        // Add popup to the marker
        marker.bindPopup(`<h3>Magnitude: ${magnitude}</h3><h3>Location: ${feature.properties.place}</h3><h3>Depth: ${depth} km</h3>`);
        
        markers.push(marker);

        // L.circleMarker([lat, lng], {
        //     fillOpacity: 1,
        //     weight: 0.5,
        //     color: "Black",
        //     fillColor: color,
        //     radius: radius
        // }).addTo(map);
    });

    createMap(L.layerGroup(markers));


};