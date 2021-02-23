// Create the tile layer that will be the background of our map
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "satellite-streets-v11",
    accessToken: API_KEY
});

var grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "light-v10",
    accessToken: API_KEY
});

var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "outdoors-v11",
    accessToken: API_KEY
});

// Create the map with our layers
var myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 3,
    layers: [
        satellitemap
        // grayscalemap,
        // outdoorsmap
    ]
});

// Add our 'grayscalemap' tile layer to the map
satellitemap.addTo(myMap);

// Create two layers for different datasets
var faultLines = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Define base map
var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": grayscalemap,
    "Outdoors": outdoorsmap
};

// Create an overlays object to add to the layer control
var overlays = {
    "Tectonic Plates": faultLines,
    "Earthquakes": earthquakes,
};

// Create a control for our layers, add our overlay layers to it
L.control.layers(baseMaps, overlays).addTo(myMap);

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (data) {

    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: markerSize(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#ea2c2c";
            case depth > 70:
                return "#ea822c";
            case depth > 50:
                return "#ee9c00";
            case depth > 30:
                return "#eecc00";
            case depth > 10:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }

    // Define a markerSize function that will give each earthquake different radius based on its magnitude
    function markerSize(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }

    L.geoJson(data, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        // We create a popup for each marker to display the magnitude and location of
        // the earthquake after the marker has been created and styled
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "Magnitude: "
                + feature.properties.mag
                + "<br>Depth: "
                + feature.geometry.coordinates[2]
                + "<br>Location: "
                + feature.properties.place
            );
        }
        // We add the data to the earthquake layer instead of directly to the map.
    }).addTo(earthquakes);

    // Then we add the earthquake layer to our map.
    earthquakes.addTo(myMap);

    // Create a legend to display information about our map
    var info = L.control({
        position: "bottomright"
    });

    info.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");

        var grades = [-10, 10, 30, 50, 70, 90];
        var colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"];

        // Loop through our intervals and generate a label with a colored square for each interval.
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: "
                + colors[i]
                + "'></i> "
                + grades[i]
                + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // We add our legend to the map.
    info.addTo(myMap);

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
        function (faultlines) {
            L.geoJson(faultlines, {
                color: "orange",
                weight: 2
            }).addTo(faultLines);
            faultLines.addTo(myMap);
        });

});
